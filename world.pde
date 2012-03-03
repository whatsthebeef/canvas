import processing.opengl.*;

float XPos;
float YPos;
int r = 0;

void setup(){
    size(600, 400, OPENGL);
    noLoop();
    XPos = width/2;
    YPos = height;
}

void draw(){

    float rotation = radians(90);

    background(255);

    pushMatrix();
    positionedTranslate(0, 300, 0);
    sphere(20);
    popMatrix();

    pushMatrix();
    positionedTranslate(0, 260, 0);
    rotateY(rotation);
    box(40, 40, 20);
    popMatrix();

    leg(10, rotation);
    leg(-10, rotation);

    r += 0.01;
    pushMatrix();
    positionedTranslate(0, 0, 0);
    rotateX(r);
    sphere(200);
    popMatrix();

}

void leg(xpos, rotate){
    pushMatrix();
    positionedTranslate(cos(rotate)*xpos, 220, sin(rotate)*xpos);
    rotateY(rotate);
    verticalPyramid(xpos, 10, -30);
    popMatrix();
}

void verticalPyramid(x, r, l){
    beginShape();

    positionedVertex(x-r, 0, x+r);
    positionedVertex(x+r, 0, x+r);
    positionedVertex(x, l, r);

    positionedVertex(x+r, 0, x+r);
    positionedVertex(x+r, 0, x-r);
    positionedVertex(x, l, r);

    positionedVertex(x+r, 0, x-r);
    positionedVertex(x-r, 0, x-r);
    positionedVertex(x, l, r);

    positionedVertex(x-r, 0, x-r);
    positionedVertex(x-r, 0, x+r);
    positionedVertex(x, l, r);

    endShape();
}

void positionedVertex(x, y, z){
    vertex(XPos + x, YPos - y, 0 + z); 
}

void positionedTranslate(x, y, z){
    positionedVertex(x, y, z);
}

