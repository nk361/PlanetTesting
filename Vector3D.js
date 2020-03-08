export class Vector3D {
    constructor(x, y = x, z = x) {//direction is assumed to be from point one to point two, start point is assumed to be origin (0, 0, 0)
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(vec2) {
        return new Vector3D(this.x + vec2.x, this.y + vec2.y, this.z + vec2.z);
    }

    subtract(vec2) {
        return this.add(new Vector3D(-vec2.x, -vec2.y, -vec2.z));
    }

    multiply(vec2) {//because of the dynamic type system, if you want to multiply by a scalar, use the Vector3D constructor with one parameter
        //return new Vector3D(this.y * vec2.z - this.z * vec2.y, this.z * vec2.x - this.x * vec2.z, this.x * vec2.y - this.y * vec2.x);//this is cross product
        return new Vector3D(this.x * vec2.x, this.y * vec2.y, this.z * vec2.z);//this multiplication seems more like scalar multiplication, but it gives the results I want
    }

    divide(scalar) {//you're just making the magnitude shorter
        return new Vector3D(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    magnitude(center = new Vector3D(0, 0, 0)) {//distance = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2) + pow(z2 - z1, 2))
        return Math.sqrt(Math.pow(this.x - center.x, 2) + Math.pow(this.y - center.y, 2) + Math.pow(this.z - center.z, 2));
    }

    unitVector(center = new Vector3D(0, 0, 0)) {//optional center to pass in so the magnitude is not from origin to endpoint
        let m = this.magnitude(center);
        return new Vector3D(this.x / m, this.y / m, this.z / m);
    }

    toString() {
        return "( " + this.x + ", " + this.y + ", " + this.z + " )";
    }
}

//Vector3D.prototype.toString = () => "( " + this.x + ", " + this.y + ", " + this.z + " )";