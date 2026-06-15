import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PredictionResult {
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
}

@Injectable()
export class PredictionService {
  constructor(private readonly prisma: PrismaService) {}

  async predictForOrder(orderId: string): Promise<PredictionResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { statusLogs: { orderBy: { createdAt: 'asc' } } },
    });

    if (!order) throw new Error(`Order ${orderId} not found`);

    const now = new Date();
    const totalSlaMs = new Date(order.slaDeadline).getTime() - new Date(order.createdAt).getTime();
    const elapsedMs = now.getTime() - new Date(order.createdAt).getTime();
    const elapsedPercent = Math.round((elapsedMs / totalSlaMs) * 100);
    const hoursRemaining = Math.round((new Date(order.slaDeadline).getTime() - now.getTime()) / (1000 * 60 * 60));

    const stageHistory = order.statusLogs
      .map((log) => `${log.toStatus} (${log.reason ?? 'no reason'})`)
      .join(' -> ');

    const prompt = `You are an operations analyst for an eyewear order management system.
Analyze this order and predict if it will breach its SLA deadline.

Order details:
- Lens type: ${order.lensType}
- Coating: ${order.coating}
- Current stage: ${order.status}
- QC failures so far: ${order.statusLogs.filter((l) => l.toStatus === 'QC_FAILED').length}
- Stage history: ${stageHistory}
- SLA window elapsed: ${elapsedPercent}%
- Hours remaining until SLA deadline: ${hoursRemaining}

Based on this, classify the breach risk as LOW, MEDIUM, or HIGH, and give a one-sentence reason citing the specific factors above.

Respond ONLY in this exact JSON format, nothing else:
{"riskBand": "LOW|MEDIUM|HIGH", "reason": "one sentence explanation"}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        riskBand: parsed.riskBand,
        reason: parsed.reason,
      };
    } catch (e) {
      console.error('Failed to parse Groq response:', content);
      return { riskBand: 'MEDIUM', reason: 'Unable to determine risk — defaulting to medium.' };
    }
  }
}