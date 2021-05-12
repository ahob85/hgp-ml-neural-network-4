// Author:

/*******************************************************************************
                          Global UI Variables

  canvasDiv, textDiv, buttonDiv, radioDiv
  In the project's HTML, the divs that will contain various elements that may
  be created in setup(). Useful for styling (e.g., keeping them all centered).

  canvas
  The p5.js canvas. This is where all the magic happens!

  textP
  This is where you will print any kind of text (e.g., the label of an image).

  buttons, notesRadio
  If included, these are for user interaction (e.g., training a model, inputting
  data).
*******************************************************************************/

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

/*******************************************************************************
                            Global ML Variables

  model
  The machine learning model we will use in this program.

  state
  The current state of the machine learning process.

  env, wave
  Variables used to generate musical notes.

  notes
  An object containing notes and their frequencies.
*******************************************************************************/

let model;
let state;
let env;
let wave;
let notes;

/******************************************************************************
                                  setup()

  This is a built-in p5.js function that is automatically called when the
  program starts, just before draw(). This is used for initializing global
  variables, building the UI, and loading images, video, data, and models.
*******************************************************************************/

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

/******************************************************************************
                                  draw()

  This is a built-in p5.js function that is automatically called in a repeated
  loop, just after setup(). This is used for handling animations, or running
  anything over and over again throughout a program.
*******************************************************************************/

function draw() {

}

/******************************************************************************
                                  modelLoaded()

  A callback function. When the model is loaded, immediately hide the radio and
  button interface (if displayed), set the program's state to "prediction" and
  display this to the user so they can begin interacting with the application
  and allowing it to predict music notes.
*******************************************************************************/

function modelLoaded() {
  radioDiv.style("display", "none");
  buttonDiv.style("display", "none");
  state = "prediction";
  textP.html("Step 3: Prediction");
}

/******************************************************************************
                               buildButtons()

  Builds all of the buttons for the program. Used to make setup() a bit less
  bulky.
*******************************************************************************/

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

/******************************************************************************
                              createMusicSystem()

  Creates the music system to be used throughout this program.
*******************************************************************************/

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

/******************************************************************************
                              trainModel()

  This function is responsible for handling everything that happens when the
  user clicks the "Train Model" button.

  1. Change the state of the program to "training".
  2. Show "Step 2: Training" to the user.
  3. Normalize the model's data using model.normalizeData().
  4. Customize the model's options. For example, set the number of epochs.
  5. Call model.train(options, whileTraining, finishedTraining).
  6. Hide all button and radio elements.

*******************************************************************************/

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

/******************************************************************************
                              whileTraining()

  What happens while the model is training. For our own information, we will
  just print the current epoch to the console.
*******************************************************************************/

function whileTraining(epoch, loss) {
  console.log(epoch);
}

/******************************************************************************
                            finishedTraining()

  What happens when the model is finished training. Change the state to
  "prediction", and display "Step 3: Prediction" to the user.
*******************************************************************************/

function finishedTraining() {
  state = "prediction";
  textP.html("Step 3: Prediction");
  saveModelButton.style("display", "inline");
}

/******************************************************************************
                    drawNote(note, noteColor, ellipseColor)

  Draw an ellipse to the canvas, filled in with the name of the note (e.g., C,
  D, E, F, G).
*******************************************************************************/

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

/******************************************************************************
                                canvasClicked()

  A callback function. What happens when the canvas is clicked. More details on
  this in the project guide.
*******************************************************************************/

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

/******************************************************************************
                          gotResults(error, results)

  This function is a callback for classify(). In other words, after MobileNet
  has classified the image, it should call this function next.

  parameters
  - error: If there was an error while running classify(), it should be brought
  up here and the function shouldn't do anything else.
  - results: The results of classify(). This will be an object we can use to
  get some useful information, such as the predicted label of the image, as
  well as how confident the model is about that assigned label.
*******************************************************************************/

function gotResults(error, results) {
  if(error) {
    console.error(error);
  } else {
    let label = results[0].label;
    drawNote(label, "white", "blue");
  }
}
