import processing.opengl.*;

float r = 0.0;

void setup(){
    size(600, 400, OPENGL);

}

void draw(){
    r += 0.01;
    background(255);
    translate(width/2, height);
    pushMatrix();
    rotateX(r);
    sphere(200);
    popMatrix();
}

