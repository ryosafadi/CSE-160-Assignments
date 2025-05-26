class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 5]);
        this.at = new Vector3([0, -60, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.pitch = 0;
        this.yaw = 0;
    }

    forward() {
        var d = new Vector3([0, 0, 0]);
        d.add(this.at);
        d.sub(this.eye).normalize().mul(0.15);
        this.eye.add(d);
        this.at.add(d);
    }
      
    backward() {
        var d = new Vector3([0, 0, 0]);
        d.add(this.at);
        d.sub(this.eye).normalize().mul(-0.15);
        this.eye.add(d);
        this.at.add(d);
    }
      
    moveRight() {
        var view = new Vector3([0, 0, 0]);
        view.add(this.at);
        view.sub(this.eye).normalize();
        var right = Vector3.cross(view, this.up).normalize().mul(0.15);
        this.eye.add(right);
        this.at.add(right);
    }
    
    moveLeft() {    
        var view = new Vector3([0, 0, 0]);
        view.add(this.at);
        view.sub(this.eye).normalize();
        var left = Vector3.cross(view, this.up).normalize().mul(-0.15);
        this.eye.add(left);
        this.at.add(left);
    }
    
    rotateRight() {
        this.yaw += 2;
        this.updateAtFromAngles();
    }

    rotateLeft() {
        this.yaw -= 2;
        this.updateAtFromAngles();
    }

    updateAtFromAngles() {
    const radYaw = this.yaw * Math.PI / 180;
    const radPitch = this.pitch * Math.PI / 180;

    const dirX = Math.cos(radPitch) * Math.sin(radYaw);
    const dirY = Math.sin(radPitch);
    const dirZ = -Math.cos(radPitch) * Math.cos(radYaw);

    const direction = new Vector3([dirX, dirY, dirZ]);
    const newAt = new Vector3([0, 0, 0]);
    newAt.add(this.eye);
    newAt.add(direction);

    this.at = newAt;
}
}