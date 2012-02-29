import processing.opengl.*;

/* @pjs preload="images/hinamonkeybird.png" */

PImage monkeybird;
float r = 0.0;
int h = 55;
int m = 0;

void setup(){
    size(600, 400, OPENGL);
    monkeybird = loadImage("images/hinamonkeybird.png");
}

void draw(){

    if(h == 55){
        m = -0.5;
    }
    else if(h == 40){
        m = +0.5;
    }
    h = h + m;
    

    background(255);
    noStroke();
    monkeybird.resize(150, 150);
    image(monkeybird, 225, h);

    r += 0.01;
    translate(width/2, height);
    pushMatrix();
    rotateX(r);
    stroke(0);
    sphere(200);
    popMatrix();
}

