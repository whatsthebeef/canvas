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

    body(0, 260, 0, 40, 40, 20, #0000FF, rotation);

    leg(-10, 220, -10, rotation,#00FF00);
    leg(10, 220, 10, rotation, #FF0000);

    r += 0.01;
    noFill();
    pushMatrix();
    positionedTranslate(0, 0, 0);
    rotateX(r);
    sphere(200);
    popMatrix();

}

void leg(xpos, ypos, zpos, rotate, color){
    pushMatrix();
    positionedTranslate(cos(-rotate)*xpos, ypos, sin(-rotate)*zpos);
    rotateY(rotate);
    verticalPyramid(10, 40, color);
    popMatrix();
}

void body(xpos, ypos, zpos, xsize, ysize, zsize, color, rotate){
    fill(color);
    pushMatrix();
    positionedTranslate(xpos, ypos, zpos);
    rotateY(rotate);
    box(xsize, ysize, zsize);
    popMatrix();
}

void verticalPyramid(r, l, color){
    beginShape();

    fill(color);
    positionedVertex(-r, -l/2, r);
    positionedVertex(+r, -l/2, r);
    positionedVertex(0, l/2, 0);

    
    fill(color);
    positionedVertex(+r, -l/2, +r);
    positionedVertex(+r, -l/2, -r);
    positionedVertex(0, l/2, 0);

    fill(color);
    positionedVertex(+r, -l/2, -r);
    positionedVertex(-r, -l/2, -r);
    positionedVertex(0, l/2, 0);

    fill(color);
    positionedVertex(-r, -l/2, -r);
    positionedVertex(-r, -l/2, +r);
    positionedVertex(0, l/2, 0);

    endShape();
}

void positionedVertex(x, y, z){
    vertex(x, y, z); 
}

void positionedTranslate(x, y, z){
    translate(XPos + x, YPos - y, 0 + z);
}

