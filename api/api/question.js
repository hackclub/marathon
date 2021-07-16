const AirtablePlus = require("airtable-plus");

const marathonTrack = new AirtablePlus({
  baseID: "appM2tajzzNei6tYe",
  apiKey: process.env.AIRTABLE,
  tableName: "Marathon Track",
});

const marathonHurdles = new AirtablePlus({
  baseID: "appM2tajzzNei6tYe",
  apiKey: process.env.AIRTABLE,
  tableName: "Marathon Hurdles",
});

const participants = new AirtablePlus({
  baseID: "appM2tajzzNei6tYe",
  apiKey: process.env.AIRTABLE,
  tableName: "Participants",
});

export default async function handler(req, res) {
  let { id, answer } = req.query;
  const participantExistsCheck = await participants.read({
    filterByFormula: `{Record ID} = "${id}"`,
    maxRecords: 1,
  });
  if (participantExistsCheck.length === 0) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }
  const racerRecord = (
    await marathonTrack.read({
      filterByFormula: `{Record ID (from Related Participant)} = "${id}"`,
      maxRecords: 1,
    })
  )[0];
  const answeredQuestion = (
    await marathonHurdles.read({
      filterByFormula: `{Number} = "${racerRecord.fields["Current Position"]}"`,
      maxRecords: 1,
    })
  )[0];
  if (answer.toUpperCase().includes(answeredQuestion.fields["Answer String"].toUpperCase()) || req.query.skip) {
    if (racerRecord.fields["Current Position"] == 30) {
      const updatedRacerRecord = await marathonTrack.update(racerRecord.id, {
        Complete: true,
        "Seconds Passed":
          racerRecord.fields["Seconds Passed"] + racerRecord.fields["Skipped"] +
          ((new Date().valueOf() / 1000)- racerRecord.fields["Last Seconds Started"]) + req.query.skip ? (60 * 5) : 0,
      });
      res.json({
        complete: true,
        correct: true,
        seconds: updatedRacerRecord.fields["Last Seconds Started"],
        user: updatedRacerRecord.fields,
      });
    } else {
      const updatedRacerRecord = await marathonTrack.update(racerRecord.id, {
        "Skipped": racerRecord.fields["Skipped"] + req.query.skip ? (60 * 5) : 0,
        "Current Position": racerRecord.fields["Current Position"] + 1,
      });
      const question = await marathonHurdles.read({
        filterByFormula: `{Number} = "${updatedRacerRecord.fields["Current Position"]}"`,
        maxRecords: 1,
      });
      if (req.query.pause) {
        const updatedRacerRecord2 = await marathonTrack.update(racerRecord.id, {
          "Last Seconds Started": (new Date().valueOf() / 1000),
          "Seconds Passed":
            (racerRecord.fields["Seconds Passed"] ? racerRecord.fields["Seconds Passed"]: 0) +
            ((new Date().valueOf() / 1000) - racerRecord.fields["Last Seconds Started"]),
        });
        
        console.log(updatedRacerRecord2)
        res.json({
          correct: true,
          paused: true,
        });
        return;
      }
      res.json({
        question: question[0].fields.Question,
        correct: true,
        index: updatedRacerRecord.fields["Current Position"],
      });
    }
  } else {
    res.status(200).json({ correct: false });
    return;
  }
}
