// Author:

// Global UI Variables
let canvasDiv;
let canvas;
let textDiv;
let textP;
let buttonDiv;
let trainButton;
let saveDataButton;
let saveModelButton;
let radioDiv;
let notesRadio;

// Global ML Variables
let model;
let state;
let env;
let wave;
let notes;

function setup() {
  canvasDiv = createDiv();
  canvas = createCanvas(640, 480);
  canvas.mousePressed(canvasClicked);
  canvas.parent(canvasDiv);
  textDiv = createDiv();
  textP = createP("Step 1: Data Collection");
  textP.parent(textDiv);
  buildButtons();
  state = "collection";
  notes = {
    C: 261.6256,
    D: 293.6648,
    E: 329.6276,
    F: 349.2282,
    G: 391.9954
  };
  let options = {
    inputs: ["x", "y"],
    outputs: ["label"],
    task: "classification",
    debug: true
  };
  model = ml5.neuralNetwork(options);
  // new code below

  createMusicSystem();
}

function draw() {

}

function modelLoaded() {
  radioDiv.style("display", "none");
  buttonDiv.style("display", "none");
  state = "prediction";
  textP.html("Step 3: Prediction");
}

function buildButtons() {
  radioDiv = createDiv();
  notesRadio = createRadio();
  notesRadio.option("C");
  notesRadio.option("D");
  notesRadio.option("E");
  notesRadio.option("F");
  notesRadio.option("G");
  notesRadio.selected("C");
  notesRadio.parent(radioDiv);
  buttonDiv = createDiv();
  trainButton = createButton("Train Model");
  trainButton.mousePressed(trainModel);
  trainButton.parent(buttonDiv);
  saveDataButton = createButton("Save Data");
  saveDataButton.mousePressed(function () {
    model.saveData();
  });
  saveDataButton.parent(buttonDiv);
  saveModelButton = createButton("Save Model");
  saveModelButton.mousePressed(function () {
    model.save();
  });
  saveModelButton.parent(buttonDiv);
  saveModelButton.style("display", "none");
}

function createMusicSystem() {
  env = new p5.Envelope();
  env.setADSR(0.05, 0.1, 0.5, 1);
  env.setRange(1.2, 0);
  wave = new p5.Oscillator();
  wave.setType("sine");
  wave.start();
  wave.freq(440);
  wave.amp(env);
}

function trainModel() {
  state = "training";
  textP.html("Step 2: Training");
  model.normalizeData();
  let options = {
    epochs: 100
  };
  model.train(options, whileTraining, finishedTraining);
  trainButton.style("display", "none");
  saveDataButton.style("display", "none");
  radioDiv.style("display", "none");
}

function whileTraining(epoch, loss) {
  console.log(epoch);
}

function finishedTraining() {
  state = "prediction";
  textP.html("Step 3: Prediction");
  saveModelButton.style("display", "inline");
}

function drawNote(note, noteColor, ellipseColor) {
  stroke(0);
  fill(ellipseColor);
  ellipse(mouseX, mouseY, 24);
  fill(noteColor);
  noStroke();
  textAlign(CENTER, CENTER);
  text(note, mouseX, mouseY);
  wave.freq(notes[note]);
  env.play();
}

function canvasClicked() {
  let inputs = {
    x: mouseX,
    y: mouseY
  };
  if(state === "collection") {
    let targetLabel = notesRadio.value();
    let target = {
      label: targetLabel
    };
    model.addData(inputs, target);
    drawNote(targetLabel, "black", "white");
  } else if(state === "prediction") {
    model.classify(inputs, gotResults);
  }
}

function gotResults(error, results) {
  if(error) {
    console.error(error);
  } else {
    let label = results[0].label;
    drawNote(label, "white", "blue");
  }
}
