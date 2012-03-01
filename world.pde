import processing.opengl.*;

float r = 0.0;

void setup(){
    size(600, 400, OPENGL);
}

void draw(){

    background(255);

    pushMatrix();
    translate(width/2, height - 300);
    sphere(20);
    popMatrix();

    pushMatrix();
    translate(width/2, height - 280);
    beginShape();
    vertex(0, 0, 0);
    vertex(20, 80, 50);
    vertex(-20, 80, 50);
    vertex(0, 0, 0);
    endShape();
    popMatrix();

    r += 0.01;
    pushMatrix();
    translate(width/2, height);
    rotateX(r);
    sphere(200);
    popMatrix();
}

