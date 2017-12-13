var serial;
let img;

let user1;
let user2;
let user1_2;
let user2_2;




// function preload() {
//   img = loadImage("frontpage_design.gif");
// }


function setup() {
  createCanvas(windowWidth, windowHeight);

  serial = new p5.SerialPort(); // make a new instance of  serialport librar

  serial.on('list', printList); // set a callback function for the serialport list event
	serial.on('connected', serverConnected); // callback for connecting to the server
	//serial.on('open', portOpen); // callback for the port opening
	serial.on('data', serialEvent); // callback for when new data arrives
	serial.on('error', serialError); // callback for errors
	serial.on('close', portClose); // callback for the port closing

  // serial.on('list', printList); // callback function for serialport list event
  // serial.on('data', serialEvent); // callback for new data coming in
  serial.list(); // list the serial ports
  // serial.open("/dev/cu.usbmodem14611"); // open a port



}


function draw() {
  background(0);
  // image(img, 0, 0,windowWidth,windowHeight);
  // console.log(user1);
  // console.log(user1_2);
  // let user1_change=user1_2-user1;
  // let user2_change=user2_2-user2;
  // console.log(user1_change);
  // console.log(user2_change);
   // if (user1_change>50 || user2_change>50){
   if(user1 > 60 || user2 > 60){
     location.replace('main.html');
     // let myLink = createA(location.href='submit_page.html','');
   }
   if (mouseIsPressed){
     location.replace('main.html');
   }
}




// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    print(i + " " + portList[i]);
  }
}

function serverConnected() {
  print('connected to server.');
}

function portOpen() {
  print('the serial port opened.')
}


function serialError(err) {
  print('Something went wrong with the serial port. ' + err);
}

function portClose() {
  print('The serial port closed.');
}


function serialEvent() {
  var stringFromSerial = serial.readLine(); // reads everything till the new line charecter
  if (stringFromSerial.length > 0) { // is the something there ?
    var trimmedString = trim(stringFromSerial); // get rid of all white space
    var myArray = split(trimmedString, ",") // splits the string into an array on commas
    console.log("myArray : "+ myArray);

    // Parse the pressure sensors readings from the 2 users
    user1 = Number(myArray[0]); // get the first item in the array and turn into integer
    user2 = Number(myArray[1]);

  // get the second item in the array and turn into integer
   // user1_2=Number(myArray[2]);
   // user2_2=Number(myArray[3]);

  }
}
