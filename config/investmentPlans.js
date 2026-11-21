const investmentPlans = [
  {
    planCode: "STARTER",
    planName: "Starter Plan",
    minAmount: 1000,
    maxAmount: 9999,
    durationDays: 30,
    dailyROIPercentage: 1.0,
    description: "1% daily ROI for 30 days",
    enabled: true
  },
  {
    planCode: "GROWTH",
    planName: "Growth Plan",
    minAmount: 10000,
    maxAmount: 49999,
    durationDays: 60,
    dailyROIPercentage: 1.5,
    description: "1.5% daily ROI for 60 days",
    enabled: true
  },
  {
    planCode: "PREMIUM",
    planName: "Premium Plan",
    minAmount: 50000,
    maxAmount: 500000,
    durationDays: 90,
    dailyROIPercentage: 2.0,
    description: "2% daily ROI for 90 days",
    enabled: true
  }
];

module.exports = investmentPlans; 
