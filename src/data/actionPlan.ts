export interface ActionPlanStep {
  id: string;
  title: string;
  description: string;
  tasks: string[];
}

export const actionPlanData: ActionPlanStep[] = [
  {
    id: 'block-1',
    title: 'Minutes 0–15: Fix Your Foundation',
    description: 'This first block is about making sure your WhatsApp Business profile looks clean, credible, and ready.',
    tasks: [
      'Update your profile (name, photo, description, category, hours)',
      'Set your greeting message (warm, professional, acknowledges new messages)',
      'Set your away message (attentive, sets expectations)'
    ]
  },
  {
    id: 'block-2',
    title: 'Minutes 15–30: Build Your Core Reply System',
    description: 'This block is about helping you reply faster and better.',
    tasks: [
      'Create your labels (New Inquiry, Interested, Hot Lead, Awaiting Payment, Paid, Delivered, Repeat Customer)',
      'Save your first 5 Quick Replies (first inquiry, price, payment, follow-up, order confirmation)',
      'Save one trust-building message for cautious buyers'
    ]
  },
  {
    id: 'block-3',
    title: 'Minutes 30–45: Prepare Your Offer Flow',
    description: 'This block is about making it easier for buyers to say yes.',
    tasks: [
      'Clean up your catalog (clear titles, decent images, sensible categories)',
      'Improve your main price response (include price + context + value + next step)',
      'Prepare your standard payment message',
      'Prepare your order-confirmation message'
    ]
  },
  {
    id: 'block-4',
    title: 'Minutes 45–60: Activate Your Lead Management System',
    description: 'This final block is where your system becomes operational.',
    tasks: [
      'Open the Lead & Order Tracker',
      'Add current active leads (inquiring, interested, close to paying, waiting for follow-up)',
      'Identify your hot leads (most likely to buy soon)',
      'Identify who needs follow-up today',
      'Send at least 1 to 3 follow-ups right now'
    ]
  }
];
