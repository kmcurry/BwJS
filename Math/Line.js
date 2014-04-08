function Line(point, dir)
{
    this.point = new Vector3D(point.x, point.y, point.z);
    this.dir = new Vector3D(dir.x, dir.y, dir.z);
}