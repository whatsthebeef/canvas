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

    float rotation = radians(45);

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
    verticalPyramid(10, 40);
    // box(20, 40, 20)
    popMatrix();
}

void verticalPyramid(r, l){
    beginShape();

    positionedVertex(-r, -l/2, r);
    positionedVertex(+r, -l/2, r);
    positionedVertex(0, l/2, 0);

    positionedVertex(+r, -l/2, +r);
    positionedVertex(+r, -l/2, -r);
    positionedVertex(0, l/2, 0);

    positionedVertex(+r, -l/2, -r);
    positionedVertex(-r, -l/2, -r);
    positionedVertex(0, l/2, 0);

    positionedVertex(-r, -l/2, -r);
    positionedVertex(-r, -l/2, +r);
    positionedVertex(0, l/2, 0);

    endShape();
}

void positionedVertex(x, y, z){
    vertex(x, y, z); 
    console.log("Triangular : " + (XPos + x), YPos - y, 0 + z);
}

void positionedTranslate(x, y, z){
    translate(XPos + x, YPos - y, 0 + z);
}

