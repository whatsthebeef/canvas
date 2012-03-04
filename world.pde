import processing.opengl.*;

float XPos;
float YPos;
int r = 0;

void setup(){
    size(600, 400, OPENGL);
    frameRate(3);
    XPos = width/2;
    YPos = height;
}

void draw(){

    float rotation = radians(0);

    background(255);
    
    head(0, 300, 0, 20);

    body(0, 260, 0, 40, 40, 20, #0000FF, rotation);

    leg(-10, 220, -10, rotation,#00FF00);
    leg(10, 220, 10, rotation, #FF0000);

    world(0, 0, 0, 200, #FFFFFF, rotation);
}

void head(xpos, ypos, zpos, rsize){
    pushMatrix();
    positionedTranslate(xpos, ypos, zpos);
    sphere(rsize);
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

void leg(xpos, ypos, zpos, rotate, color){
    pushMatrix();
    positionedTranslate(cos(-rotate)*xpos, ypos, sin(-rotate)*zpos);
    rotateY(rotate);
    verticalPyramid(10, 40, color);
    popMatrix();
}

void world(xpos, ypos, zpos, rsize, color, rotate){
    fill(color);
    r += 0.01;
    pushMatrix();
    positionedTranslate(xpos, ypos, zpos);
    rotateX(cos(rotate)*r);
    rotateZ(sin(rotate)*r);
    sphere(rsize);
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

