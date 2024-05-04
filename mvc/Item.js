const Item = class{
    static GET(type, x, y){return new Item(type, x, y);}
    constructor(_type, _x, _y){
        prop({_this,_type, _x, _y, selected:false, _prev:null});
    }
    get type(){return this._type;};
    get x(){return this._x;};
    get y(){return this._y;};
    get selected(){return this._selected;}
    get prev(){return this._prev};

    pos(x, y){
        this._x = x;
        this._y = y;
    }
    select(item){
        this._selected = true;
        this._prev = item;
    }
    unselected(){
        this._selected = false;
        this.prev = null;
    }

    isSelectedList(item){
        if(!this.prev) return false;
        if(this._prev == item) return true;
        else return this._prev.isSelectedList(item);
    }

    isBorder(item){
        return Math.abs(this.x = item.x) < 2 && Math.abs(this.y - item.y) < 2;
    }

    
}