export interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

export const checklistData: ChecklistGroup[] = [
  {
    id: 'business-profile',
    title: 'Business Profile Setup',
    description: 'Your business profile is one of the first trust signals a buyer notices. Make sure it sends the right message.',
    items: [
      {
        id: 'bp-1',
        text: 'Business name is clear and correct',
        description: 'Your name should be easy to recognize and consistent with how customers know your business.'
      },
      {
        id: 'bp-2',
        text: 'Profile photo looks professional',
        description: 'Use a clean logo or clear business image. Avoid blurry, random, or confusing display pictures.'
      },
      {
        id: 'bp-3',
        text: 'Business description is complete',
        description: 'Your description should briefly explain what you do and who you serve. E.g., "We provide fast, reliable branding and design services for small businesses."'
      },
      {
        id: 'bp-4',
        text: 'Business category is correct',
        description: 'Choose the closest category to what you actually do.'
      },
      {
        id: 'bp-5',
        text: 'Business hours are set',
        description: 'Let customers know when you are available so expectations are clear.'
      },
      {
        id: 'bp-6',
        text: 'Location or service area is clear, if relevant',
        description: 'Especially useful for delivery-based or location-sensitive businesses.'
      },
      {
        id: 'bp-7',
        text: 'Email, website, or social links are added, if available',
        description: 'These can improve trust and make your business feel more established.'
      }
    ]
  },
  {
    id: 'sales-tools',
    title: 'Sales Tool Setup',
    description: 'WhatsApp Business gives you a few simple tools that can make your selling much more efficient when set up properly.',
    items: [
      {
        id: 'st-1',
        text: 'Greeting message is set',
        description: 'Use this to welcome new contacts or people messaging after a long gap. A strong greeting message should feel warm, simple, and professional.'
      },
      {
        id: 'st-2',
        text: 'Away message is set',
        description: 'Use this when you are unavailable so customers are acknowledged instead of ignored.'
      },
      {
        id: 'st-3',
        text: 'Quick Replies are created for common messages',
        description: 'At minimum, save quick replies for: first inquiry response, price response, payment instruction, follow-up reminder, order confirmation.'
      },
      {
        id: 'st-4',
        text: 'Labels are created and ready to use',
        description: 'Recommended labels: New Inquiry, Interested, Hot Lead, Awaiting Payment, Paid, Delivered, Repeat Customer.'
      },
      {
        id: 'st-5',
        text: 'Catalog is uploaded or cleaned up',
        description: 'Your catalog should make browsing easier, not more confusing.'
      },
      {
        id: 'st-6',
        text: 'Collections are organized',
        description: 'Group similar products or service categories together so customers can navigate more easily.'
      }
    ]
  },
  {
    id: 'conversion-readiness',
    title: 'Conversion Readiness Check',
    description: 'Is your WhatsApp actually ready to convert conversations into sales? This helps you check the essentials.',
    items: [
      {
        id: 'cr-1',
        text: 'Your first-response message feels warm and professional',
        description: 'It should welcome the buyer and guide the conversation forward.'
      },
      {
        id: 'cr-2',
        text: 'Your price response is stronger than "just the number"',
        description: 'It should include price plus context, value, or next step.'
      },
      {
        id: 'cr-3',
        text: 'You have a saved trust-building response',
        description: 'For cautious or first-time buyers.'
      },
      {
        id: 'cr-4',
        text: 'You have a saved delivery/process explanation',
        description: 'This helps reduce uncertainty.'
      },
      {
        id: 'cr-5',
        text: 'You have a saved payment message',
        description: 'Clear, simple, and professional.'
      },
      {
        id: 'cr-6',
        text: 'You have a saved order-confirmation message',
        description: 'So buyers feel reassured after payment.'
      },
      {
        id: 'cr-7',
        text: 'You have at least one follow-up message ready',
        description: 'Many sales are won in follow-up, not in the first reply.'
      }
    ]
  },
  {
    id: 'daily-operations',
    title: 'Daily Operations Check',
    description: 'You need a repeatable operating rhythm so hot leads do not fall through the cracks.',
    items: [
      {
        id: 'do-1',
        text: 'Tracker is ready to use',
        description: 'Your Lead & Order Tracker should already be open and accessible.'
      },
      {
        id: 'do-2',
        text: 'Active leads have been entered into the tracker',
        description: 'Especially serious leads and pending orders.'
      },
      {
        id: 'do-3',
        text: 'Hot leads have been identified',
        description: 'You should know who is closest to buying.'
      },
      {
        id: 'do-4',
        text: 'Follow-up due list is visible',
        description: 'You should know who needs a reminder today.'
      },
      {
        id: 'do-5',
        text: 'You have a simple routine for morning, midday, and evening check-ins',
        description: 'Consistency is what keeps the system working.'
      }
    ]
  }
];
