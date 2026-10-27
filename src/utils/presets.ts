import { PresetSample } from '../types';

export const PRESET_TEST_CASES: PresetSample[] = [
  {
    id: 'sample-1',
    title: '[DEMO SAMPLE] Viral Health Miracle Hoax',
    category: 'Sensational Medical',
    type: 'text',
    content:
      'SHOCKING DISCOVERY: Boiling pure lemon peel with crushed garlic and warm honey cures 100% of viral infections and cancer overnight! The pharmaceutical mafia and corrupt medical boards are furious and banning this recipe everywhere! Share this life-saving secret before it gets deleted from Facebook!',
    expectedTier: 'High Misinformation Risk',
    description: 'DEMO SAMPLE: Features sensational clickbait, miracle cure claims, manufactured urgency, uppercase markers, and conspiracy framing.'
  },
  {
    id: 'sample-2',
    title: '[DEMO SAMPLE] WhatsApp Chain SIM Deactivation Alert',
    category: 'WhatsApp Forward',
    type: 'text',
    content:
      'URGENT ALERT: UNESCO and World Cyber Security Council issued immediate warning! Tonight at 11:59 PM, all mobile phone SIM cards without biometric verification will be permanently deactivated by military command! Forward this urgent message to at least 10 groups immediately to protect your bank accounts!',
    expectedTier: 'High Misinformation Risk',
    description: 'DEMO SAMPLE: Classic WhatsApp panic chain forward with false authority attribution (UNESCO/Military) and viral forward triggers.'
  },
  {
    id: 'sample-3',
    title: '[DEMO SAMPLE] Peer-Reviewed Clinical Trial Publication',
    category: 'Genuine Scientific',
    type: 'text',
    content:
      'According to a multi-center study published in The New England Journal of Medicine, a revised low-dose combination therapy demonstrated a 24 percent reduction in cardiovascular complications among monitored adults over a three-year longitudinal observation period. The researchers noted that further randomized clinical trials remain necessary.',
    expectedTier: 'Potentially Reliable',
    description: 'DEMO SAMPLE: Cautious academic phrasing, peer-reviewed attribution, probabilistic statistics, and institutional citations.'
  },
  {
    id: 'sample-4',
    title: '[DEMO SAMPLE] Viral 15 Days of Planetary Darkness Hoax',
    category: 'Viral Rumor',
    type: 'text',
    content:
      'BREAKING: NASA scientists officially confirmed that Planet Earth will plunge into 15 days of complete and total darkness starting on November 15 due to a rare cosmic alignment between Venus and Jupiter! Mainstream media is ordered to stay silent! Stock up on candles and emergency food now!',
    expectedTier: 'High Misinformation Risk',
    description: 'DEMO SAMPLE: Recurrent internet urban legend falsely attributed to NASA with apocalyptic framing and secrecy tropes.'
  },
  {
    id: 'sample-5',
    title: '[DEMO SAMPLE] Official Coastal Weather Advisory Report',
    category: 'Genuine Scientific',
    type: 'text',
    content:
      'The National Weather Service has issued a coastal flood watch for low-lying sectors along the mid-Atlantic coastline effective Friday afternoon through Saturday morning. Municipal authorities advise residents to monitor local updates and exercise standard flood preparedness precautions.',
    expectedTier: 'Potentially Reliable',
    description: 'DEMO SAMPLE: Official institutional guidance, neutral informative tone, specific geographic and temporal parameters.'
  }
];
