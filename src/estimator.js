/* eslint-disable max-len */
const covid19ImpactEstimator = (data) => {
  const {
    reportedCases, timeToElapse, periodType, totalHospitalBeds, region
  } = data;
  const { avgDailyIncomeInUSD, avgDailyIncomePopulation } = region;

  const availableBeds = Math.ceil(0.35 * totalHospitalBeds);
  // const timeToElapseInt = Math.floor(timeToElapse);
  let numDays = timeToElapse;

  if (periodType === 'weeks') {
    numDays = timeToElapse * 7;
  } else if (periodType === 'months') {
    numDays = timeToElapse * 30;
  }

  const setsOfThreeDays = Math.floor(numDays / 3);

  const input = data;
  const impact = {};
  const severeImpact = {};

  impact.currentlyInfected = reportedCases * 10;
  impact.infectionsByRequestedTime = impact.currentlyInfected * (2 ** setsOfThreeDays);

  severeImpact.currentlyInfected = reportedCases * 50;
  severeImpact.infectionsByRequestedTime = severeImpact.currentlyInfected * (2 ** setsOfThreeDays);

  // Challenge 2
  impact.severeCasesByRequestedTime = Math.floor(0.15 * impact.infectionsByRequestedTime);
  severeImpact.severeCasesByRequestedTime = Math.floor(0.15 * severeImpact.infectionsByRequestedTime);

  impact.hospitalBedsByRequestedTime = availableBeds - impact.severeCasesByRequestedTime;
  severeImpact.hospitalBedsByRequestedTime = availableBeds - severeImpact.severeCasesByRequestedTime;

  // Challenge 3
  impact.casesForICUByRequestedTime = Math.floor(0.05 * impact.infectionsByRequestedTime);
  impact.casesForVentilatorsByRequestedTime = Math.floor(0.02 * impact.infectionsByRequestedTime);
  impact.dollarsInFlight = Math.floor((impact.infectionsByRequestedTime * avgDailyIncomePopulation * avgDailyIncomeInUSD) / numDays);

  severeImpact.casesForICUByRequestedTime = Math.floor(0.05 * severeImpact.infectionsByRequestedTime);
  severeImpact.casesForVentilatorsByRequestedTime = Math.floor(0.02 * severeImpact.infectionsByRequestedTime);
  severeImpact.dollarsInFlight = Math.floor((severeImpact.infectionsByRequestedTime * avgDailyIncomePopulation * avgDailyIncomeInUSD) / numDays);

  return { data: input, impact, severeImpact };
};

export default covid19ImpactEstimator;
