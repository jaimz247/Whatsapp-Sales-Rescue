export type ScriptCategory = 
  | 'First Response'
  | 'Trust-Building'
  | 'Clarification & Qualification'
  | 'Price Presentation'
  | 'Price Defense'
  | 'Objection Handling'
  | 'Ghosting Recovery'
  | 'Closing & Payment'
  | 'Order Confirmation & Fulfillment'
  | 'Retention & Repeat Sale'
  | 'Quick Replies to Save First'
  | 'Tone Variations';

export interface Script {
  id: string;
  title: string;
  scenario: string;
  whenToUse: string;
  script: string;
  optionalVariation?: string;
  toneNote: string;
  category: ScriptCategory;
  isTop15?: boolean;
}

export const scripts: Script[] = [
  {
    id: 'A1',
    title: 'General Product Inquiry Opener',
    scenario: 'A buyer sends "Hi", "Hello", or asks about a product.',
    whenToUse: 'First response to a product inquiry.',
    script: 'Hello, thanks for reaching out. Yes, this is available. Please tell me the exact [product/size/colour/quantity] you’re interested in, and I’ll guide you properly.',
    optionalVariation: 'Hi, thank you for messaging us. You’re welcome. Please let me know the exact item you want, and I’ll share the full details right away.',
    toneNote: 'Warm, professional.',
    category: 'First Response',
    isTop15: true,
  },
  {
    id: 'A2',
    title: 'General Service Inquiry Opener',
    scenario: 'A buyer asks about a service.',
    whenToUse: 'First response to a service lead.',
    script: 'Hello, thanks for reaching out. Yes, we offer this service. Kindly tell me exactly what you need, and I’ll explain the best option for you.',
    optionalVariation: 'Hi, thank you for contacting us. I’d be glad to help. Please share what you need done, and I’ll walk you through the right package.',
    toneNote: 'Helpful, consultative.',
    category: 'First Response',
  },
  {
    id: 'A3',
    title: 'Warm Lead Opener',
    scenario: 'Buyer came from your post, ad, or status and is already interested.',
    whenToUse: 'First response to a lead with visible buying intent.',
    script: 'Hello, thanks for your interest. You’re in the right place. Please tell me which [product/service] you’re interested in, and I’ll send the details so you can decide quickly.',
    optionalVariation: 'Hi, thanks for reaching out. I’m happy to help. Let me know exactly what caught your interest, and I’ll send you the right details immediately.',
    toneNote: 'Confident, efficient.',
    category: 'First Response',
  },
  {
    id: 'A6',
    title: 'Delayed Reply Recovery Opener',
    scenario: 'You are responding late.',
    whenToUse: 'When you need to recover after a delayed response.',
    script: 'Hello, thank you for your patience, and I’m sorry for the delayed response. I’m here now and ready to help. Please let me know if you’re still interested in the [product/service].',
    optionalVariation: 'Hi, apologies for the delayed reply, and thank you for your patience. I’m available now. If you’re still interested, I’ll gladly continue from here.',
    toneNote: 'Polite, responsible.',
    category: 'First Response',
  },
  {
    id: 'B1',
    title: 'First-Time Buyer Reassurance',
    scenario: 'Buyer is engaging for the first time and may be unsure.',
    whenToUse: 'Early in the conversation with a new prospect.',
    script: 'That’s completely fine. If this is your first time ordering from us, I’ll guide you through the process clearly so everything is easy and straightforward.',
    optionalVariation: 'No problem at all. I understand first-time buyers usually want clarity. I’ll explain each step properly so you can feel comfortable before making a decision.',
    toneNote: 'Calming, trust-building.',
    category: 'Trust-Building',
    isTop15: true,
  },
  {
    id: 'B3',
    title: 'Delivery Reassurance Reply',
    scenario: 'Buyer worries about receiving the item.',
    whenToUse: 'When they ask about delivery certainty.',
    script: 'Yes, we deliver, and we always make the process clear from the start. Once your order is confirmed, we’ll guide you through delivery timelines and keep you updated properly.',
    optionalVariation: 'Delivery is part of our process, and we make it as smooth as possible. Once your order is confirmed, I’ll explain the timeline and next steps clearly.',
    toneNote: 'Reliable, organized.',
    category: 'Trust-Building',
  },
  {
    id: 'C1',
    title: 'Clarifying Exact Need',
    scenario: 'You need the buyer to specify what they want.',
    whenToUse: 'Early-stage clarification.',
    script: 'Please tell me exactly what you’re looking for so I can recommend the right option for you.',
    optionalVariation: 'Kindly share the exact item/service you need, and I’ll guide you based on that.',
    toneNote: 'Simple, direct.',
    category: 'Clarification & Qualification',
  },
  {
    id: 'D2',
    title: 'Price with Value Framing',
    scenario: 'You want to avoid "naked pricing."',
    whenToUse: 'When value explanation will improve conversion.',
    script: 'The price is [price], and that includes [key value/benefit/feature]. If you’d like, I can also explain the next step so you can decide easily.',
    optionalVariation: 'This is [price], and it covers [what’s included]. It’s designed to give you [benefit], not just the item/service itself.',
    toneNote: 'Strong, value-led.',
    category: 'Price Presentation',
    isTop15: true,
  },
  {
    id: 'D4',
    title: 'Price with 2 Options',
    scenario: 'You want to give buyer a choice.',
    whenToUse: 'When a two-tier offer helps decision-making.',
    script: 'You have 2 options:\nOption 1: [offer] — [price]\nOption 2: [offer] — [price]\nIf you want, I can help you choose the one that suits you best.',
    optionalVariation: 'There are 2 available options depending on your need and budget. I can guide you on which one fits you better.',
    toneNote: 'Helpful, choice-based.',
    category: 'Price Presentation',
    isTop15: true,
  },
  {
    id: 'E1',
    title: 'Polite No-Discount Reply',
    scenario: 'Buyer asks for discount.',
    whenToUse: 'When you want to hold price.',
    script: 'The price shared is already our best fair price for the value we provide. I’d love to help you proceed with it if you’re ready.',
    optionalVariation: 'At the moment, that is the best price available for this offer. We’ve priced it carefully to keep the quality and value intact.',
    toneNote: 'Polite, firm.',
    category: 'Price Defense',
    isTop15: true,
  },
  {
    id: 'F1',
    title: '"It’s Too Expensive"',
    scenario: 'Buyer says your offer is costly.',
    whenToUse: 'On direct price objection.',
    script: 'I understand. Usually, when people say that, it helps to look at what is included and the value they’re actually getting. If you’d like, I can break that down for you simply.',
    optionalVariation: 'I understand your concern. Price is important, but so is what you’re getting for it. I can explain the value clearly if that helps.',
    toneNote: 'Calm, reframing.',
    category: 'Objection Handling',
    isTop15: true,
  },
  {
    id: 'F3',
    title: '"I Need to Think About It"',
    scenario: 'Buyer is undecided.',
    whenToUse: 'When buyer wants time.',
    script: 'That’s perfectly fine. Take your time, and if it helps, I can quickly summarise the option for you so it’s easier to make a decision.',
    optionalVariation: 'No problem at all. If you’d like, I can send you a simple recap of the offer so you have everything clearly in front of you.',
    toneNote: 'Patient, supportive.',
    category: 'Objection Handling',
  },
  {
    id: 'G1',
    title: 'Follow-Up After Price Was Sent',
    scenario: 'Buyer asked for price but went silent.',
    whenToUse: '12–48 hours after quoting.',
    script: 'Hello, just checking in on the [product/service] details I sent earlier. Please let me know if you’d like to proceed or if you have any questions I can help with.',
    optionalVariation: 'Hi, I’m following up on the details I shared earlier. If you need any clarification before deciding, I’m happy to help.',
    toneNote: 'Soft, professional.',
    category: 'Ghosting Recovery',
    isTop15: true,
  },
  {
    id: 'G6',
    title: 'Soft Reminder Follow-Up',
    scenario: 'Gentle nudge needed.',
    whenToUse: 'Standard follow-up.',
    script: 'Hello, just a gentle reminder regarding the [product/service] we discussed. If you’re still interested, I’d be happy to assist you further.',
    optionalVariation: 'Hi, just touching base on our earlier conversation. Let me know if you’d like to proceed or if you need any clarification.',
    toneNote: 'Soft, polite.',
    category: 'Ghosting Recovery',
    isTop15: true,
  },
  {
    id: 'G10',
    title: 'Final Close-the-Loop Follow-Up',
    scenario: 'Last follow-up before closing.',
    whenToUse: 'Final message after no response.',
    script: 'Hello, I’ll leave this here for now so I don’t disturb you further. If you decide to proceed later, feel free to message me anytime, and I’ll be glad to help.',
    optionalVariation: 'Hi, I’ll pause follow-up here for now. If and when you’re ready, you can always reach out, and I’ll gladly assist you.',
    toneNote: 'Graceful, professional.',
    category: 'Ghosting Recovery',
    isTop15: true,
  },
  {
    id: 'H2',
    title: 'Payment Instruction Message',
    scenario: 'Buyer is ready to pay.',
    whenToUse: 'At payment stage.',
    script: 'To proceed, kindly make payment to:\n[Account Name]\n[Bank Name]\n[Account Number]\nAfter payment, please send your payment confirmation here so I can confirm your order immediately.',
    optionalVariation: 'Here are the payment details to proceed:\n[details]\nOnce payment is made, kindly send proof here, and I’ll confirm the next step right away.',
    toneNote: 'Clear, precise.',
    category: 'Closing & Payment',
    isTop15: true,
  },
  {
    id: 'H5',
    title: 'Order Summary Before Payment',
    scenario: 'Buyer is ready, and you want clarity before payment.',
    whenToUse: 'Right before asking for payment.',
    script: 'Just to confirm, your order is:\n[product/service]\n[quantity/package]\n[price]\n[delivery/pickup note if needed]\nIf all is correct, I’ll send the payment details now.',
    optionalVariation: 'Here’s a quick summary of your order before payment:\n[details]\nPlease confirm this is correct, and I’ll send the payment details immediately.',
    toneNote: 'Organized, premium.',
    category: 'Closing & Payment',
    isTop15: true,
  },
  {
    id: 'I1',
    title: 'Payment Received Confirmation',
    scenario: 'Buyer has paid.',
    whenToUse: 'Immediately after verifying payment.',
    script: 'Payment received successfully, thank you. Your order is now confirmed, and we’ll proceed from here.',
    optionalVariation: 'Thank you, I’ve received and confirmed your payment. Your order is now being processed.',
    toneNote: 'Reassuring, efficient.',
    category: 'Order Confirmation & Fulfillment',
    isTop15: true,
  },
  {
    id: 'I4',
    title: 'Dispatch / Shipping Update',
    scenario: 'Item has been sent out.',
    whenToUse: 'Once dispatch happens.',
    script: 'Your order has been dispatched successfully. I’ll share any relevant update/details so you can track the next stage smoothly.',
    optionalVariation: 'Your order is now on the way. I’ll keep you updated with the necessary delivery information.',
    toneNote: 'Reassuring.',
    category: 'Order Confirmation & Fulfillment',
    isTop15: true,
  },
  {
    id: 'J4',
    title: 'Review Request',
    scenario: 'You want a short review.',
    whenToUse: 'After successful delivery/completion.',
    script: 'If you were happy with your experience, I’d really appreciate a short review from you. Your feedback helps us grow and serve better.',
    optionalVariation: 'I’d be grateful if you could share a brief review of your experience. It would mean a lot to us.',
    toneNote: 'Grateful, professional.',
    category: 'Retention & Repeat Sale',
    isTop15: true,
  },
  {
    id: 'J1',
    title: 'Repeat Purchase Prompt',
    scenario: 'Buyer may need another order soon.',
    whenToUse: 'After a positive first purchase.',
    script: 'Whenever you’re ready for your next order, I’ll be glad to help again. If you’d like, I can also let you know when we have something similar or suitable for you.',
    optionalVariation: 'If you need this again later, feel free to reach out anytime. I’d be happy to help you with your next order as well.',
    toneNote: 'Warm, open-ended.',
    category: 'Retention & Repeat Sale',
    isTop15: true,
  }
];
