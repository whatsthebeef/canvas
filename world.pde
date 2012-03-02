import processing.opengl.*;

float r = 0.0;
int l = 0.0;

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
    translate(width/2, height - 260);
    rotateY(PI/4);
    box(40, 40, 20);
    popMatrix();

    l += 1;
    pushMatrix();
    translate(width/2 - 5, height - 220);
    rotateY(PI/4);
    box(10, 40, 10);
    popMatrix();

    pushMatrix();
    translate(width/2 + 5, height - 220);
    rotateY(PI/4);
    box(10, 40, 10);
    popMatrix();

    r += 0.01;
    pushMatrix();
    translate(width/2, height);
    rotateX(r);
    sphere(200);
    popMatrix();

    translate(width/2, height);
    rotate(PI/4);
}

