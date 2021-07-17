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
  let { id } = req.query;
  const participantExistsCheck = await participants.read({
    filterByFormula: `{Record ID} = "${id}"`,
    maxRecords: 1,
  });
  if (participantExistsCheck.length === 0) {
    res.status(404).json({ error: "Participant not found." });
    return;
  }
  const startedAlreadyCheck = await marathonTrack.read({
    filterByFormula: `{Record ID (from Related Participant)} = "${id}"`,
    maxRecords: 1,
  });
  if (startedAlreadyCheck[0] === undefined) {
    const racerRecord = await marathonTrack.create({
      "Related Participant": [id],
      "Last Seconds Started": (new Date().valueOf() / 1000),
      "Current Position": 1,
      "Skipped": 0,
      "Seconds Passed": 0
    });
    const question = await marathonHurdles.read({
      filterByFormula: `{Number} = "1"`,
      maxRecords: 1,
    });
    res.json({
      question: question[0].fields.Question,
      user: racerRecord.fields,
      index: racerRecord.fields["Current Position"],
      starting: true,
    });
  } else {
    const racerRecord = startedAlreadyCheck[0];
    console.log(((new Date().valueOf() / 1000) - racerRecord.fields["Last Seconds Started"]))
    if (racerRecord.fields["Complete"] == true) {
      res.json({
        user: racerRecord.fields,
        starting: false,
        complete: true,
      });
      return
    }
    const question = await marathonHurdles.read({
      filterByFormula: `{Number} = "${racerRecord.fields["Current Position"]}"`,
      maxRecords: 1,
    });
    console.log((new Date().valueOf() / 1000))
    console.log(((new Date().valueOf() / 1000) - racerRecord.fields["Last Seconds Started"]))
    res.json({
      question: question[0].fields.Question,
      user: racerRecord.fields,
      index: racerRecord.fields["Current Position"],
      starting: false,
    });
  }
}
