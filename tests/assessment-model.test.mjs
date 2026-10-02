import test from "node:test";
import assert from "node:assert/strict";
import { calculateAssessment, domains, indicators, occupationDataProvider, occupationsForDomain, questions, transitionComparison } from "../src/assessment-model.js";

const answerSet = (value = 2) => Object.fromEntries(questions.map(({ id }) => [id, value]));
const transitionSet = (value = 2) => Object.fromEntries(["T01", "T02", "T03", "T04", "T05"].map((id) => [id, value]));

test("V1.2 question bank has exactly 40 scored items across 8 groups", () => {
  assert.equal(questions.length, 40);
  assert.equal(indicators.length, 8);
  assert.deepEqual(questions.map(({ id }) => id), Array.from({ length: 40 }, (_, i) => `Q${String(i + 1).padStart(2, "0")}`));
  for (let i = 0; i < 8; i += 1) {
    const group = questions.slice(i * 5, i * 5 + 5);
    assert.equal(group.length, 5);
    assert.ok(group.every((q) => q.indicator === indicators[i].id));
    assert.equal(group.reduce((sum, q) => sum + q.weight, 0), 100);
    assert.ok(group.every((q) => q.options.length === 5));
  }
});

test("ordinal values normalize and Q05 reverses", () => {
  for (let value = 0; value <= 4; value += 1) {
    const answers = answerSet(value);
    const { responseScoreByIndicator } = calculateAssessment(answers, "graphic-designer", "D03");
    assert.equal(responseScoreByIndicator.AR, [20, 35, 50, 65, 80][value]);
  }
  const low = answerSet(0);
  const high = answerSet(4);
  assert.equal(calculateAssessment(low, "graphic-designer", "D03").responseScoreByIndicator.AR, 20);
  assert.equal(calculateAssessment(high, "graphic-designer", "D03").responseScoreByIndicator.AR, 80);
});

test("occupation priors and alpha blend follow V1.2, with unvalidated CR left unblended", () => {
  const report = calculateAssessment(answerSet(2), "accountant", "D02");
  assert.equal(report.responseScoreByIndicator.AR, 50);
  assert.equal(report.indicators.AR, .55 * 73 + .45 * 50);
  assert.equal(report.indicators.AE, .5 * 82 + .5 * 50);
  assert.equal(report.indicators.AUG, .35 * 79 + .65 * 50);
  assert.equal(report.indicators.HA, .4 * 61 + .6 * 50);
  assert.equal(report.indicators.CR, 50);
  assert.equal(report.position, .13*(100-report.indicators.AR)+.10*(100-report.indicators.AE)+.12*report.indicators.AUG+.14*report.indicators.HA+.14*50+.14*50+.12*50+.11*50);
  assert.equal(report.evidenceCoverage, "Limited");
  assert.equal(report.occupation.evidenceCoverage, "Limited");
});

test("domain and occupation selection changes profile and recommendations base", () => {
  assert.equal(domains.length, 13);
  assert.ok(occupationsForDomain("D03").some((item) => item.id === "ux-designer"));
  const current = occupationDataProvider.getProfile("graphic-designer", "D03");
  const target = occupationDataProvider.getProfile("ux-designer", "D03");
  assert.notDeepEqual(current.baselines, target.baselines);
  const report = calculateAssessment(answerSet(3), "graphic-designer", "D03");
  assert.equal(report.occupation.label, "Graphic designer");
});

test("invalid or incomplete assessments cannot produce a report", () => {
  assert.throws(() => calculateAssessment({}, "accountant", "D02"), /Răspuns invalid/);
  const answers = answerSet(1);
  answers.Q40 = 5;
  assert.throws(() => calculateAssessment(answers, "accountant", "D02"), /Răspuns invalid/);
});

test("transition engine uses T01-T04 in TRS and keeps T05 contextual", () => {
  const report = calculateAssessment(answerSet(3), "graphic-designer", "D03");
  const low = transitionComparison("graphic-designer", "ux-designer", report.indicators, transitionSet(1), "D03", "D03");
  const high = transitionComparison("graphic-designer", "ux-designer", report.indicators, transitionSet(4), "D03", "D03");
  assert.ok(high.readiness > low.readiness);
  const laterHorizon = transitionSet(4); laterHorizon.T05 = 0;
  assert.equal(transitionComparison("graphic-designer", "ux-designer", report.indicators, laterHorizon, "D03", "D03").readiness, high.readiness);
  assert.equal(high.horizon, 4);
  assert.equal(high.evidenceCurrent, "Limited");
  assert.equal(high.evidenceTarget, "Limited");
  assert.notEqual(high.overlap, 100);
});
