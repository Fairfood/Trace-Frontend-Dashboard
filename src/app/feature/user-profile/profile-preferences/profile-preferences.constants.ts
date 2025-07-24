import { NotificationPreference } from './profile-preferences.model';

export const REQUESTS_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    name: 'Receive Stock Request',
    type: 16,
    is_blocked: false,
  },
  {
    name: 'Decline Stock Request',
    type: 17,
    is_blocked: false,
  },
  {
    name: 'Receive Claim Request',
    type: 22,
    is_blocked: false,
  },
  {
    name: 'Decline Claim Request',
    type: 23,
    is_blocked: false,
  },
  {
    name: 'Receive Information Request',
    type: 24,
    is_blocked: false,
  },
  {
    name: 'Decline Information Request',
    type: 25,
    is_blocked: false,
  },
  {
    name: 'Receive Connection Request',
    type: 26,
    is_blocked: false,
  },
  {
    name: 'Decline Connection Request',
    type: 27,
    is_blocked: false,
  },
  {
    name: 'Receive Verification Request',
    type: 18,
    is_blocked: false,
  },
];

export const TR_CLAIM_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    name: 'Receive Stock',
    type: 13,
    is_blocked: false,
  },
  // {
  //   name: 'Sent Stock',
  //   type: 14,
  //   is_blocked: false,
  // },
  {
    name: 'Transaction Rejected',
    type: 15,
    is_blocked: false,
  },
  {
    name: 'Approved Claim',
    type: 19,
    is_blocked: false,
  },
  {
    name: 'Rejected Claim',
    type: 20,
    is_blocked: false,
  },
  // {
  //   name: 'Claim Comment',
  //   type: 21,
  //   is_blocked: false,
  // },
];

export const REMAINDERS_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    name: 'Week One Reminder',
    type: 30,
    is_blocked: false,
  },
  {
    name: 'Week Two Reminder',
    type: 31,
    is_blocked: false,
  },
];
