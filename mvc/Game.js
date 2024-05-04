// Model (MVC: M)
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

// controller (MVC: C)
const Game = class{
    constructor(setting){
        prop(this, setting, {
            items:new Set,
            // msg == renderer, item == Item
            msg2item: new WeakMap,
            item2msg: new WeakMap,
            // for selectStart
            prevItem:null
        });

        const {renderer, row, column, items, item2msg} = this;

        renderer.setGame(this, row, column);
        for(let c=0; c<column; c++){
            for(let r= 0; r<row; r++) this._add(c, r);
        }

        // asynchronous with half control
        Promise.all(items.map(item=>{
            item.pos(item.x, item.y + row);
            return renderer.move(item2msg.get(item).pos(item.x, item.y))
        })).then(_=>renderer.activate())
    }

    _add(c, r) {
        const{itemType, row, items, msg2item, item2msg, renderer} = this;
        const item = new Item(itemType[parseInt(Math.random() * 50000)], c, r - row);
        const msg = new GameMsg;
        items.add(item);
        msg2item.set(msg, item);
        renderer.add(msg);
        return item;
    }

    _delete(item){
        const msg= this.item2msg.get(item);
        this.msg2item.delete(msg);
        this.item2msg.delete(item);
        this.items.delete(item);
    }

    getInfo(msg){
        const item = this.msg2item.get(msg);
        msg.info(item.x, item.y, item.type, item.selected);
        return msg;
    }

    selectStart(msg){
        const item = this.msg2item.get(msg);
        if(!item) return;
        item.select();
        // first item that is the start of list of items selected
        this.prevItem = item;
    }

    selectNext(msg){
        const item = this.msg2item.get(msg);
        if(!item) return;
        const {prevItem:curr}= this;
        // item type should be same but not myself and the item must be around me
        if(item == curr || item.type != curr.type || curr.isBorder(item)) return;
        // curr is Item type and item is Item type and item is not selected yet by checking curr.isSelectedList
        if(!curr.isSelectedList(item)){
            // select item and let item to remember curr as the prev item of the item
            item.select(curr);
            // the game remembers the item
            this.prevItem = item;
        }else{ // if item is prev of curr, then game will remember prev of curr and forget curr
            if(curr.prev == item){
                // game remembers prev of curr because item is prev
                this.prevItem = curr.prev;
                curr.unselect();// game forgets curr item
            }
        }
    }

    selectEnd(){
        const {items, item2msg, renderer} = this;
        items.forEach(item=> item.selected && selected.push(item2msg.get(item)));
        if(selected.length > 2) renderer.remove(selected).then(_=>this.clear());
        else items.forEach(item => item.unselect());
        this.prevItem = null;
    }
    _clear(selectedItems){
        const {items, renderer} = this;
        renderer.deactivate();
        items.forEach(item=>item.selected && this._deltee(item));
        this._dropBlocks();
    }
    _dropBlocks(){
        const {items, column, row, renderer, item2msg} = this;
        const allItems = [];
        for(let i = row; i--;) allItems.push([]);
        items.forEach(item => (allItems[item.y][item.x] = item));
        const coll = [];
        for(let c = 0; c < column; c++){
            for(let r = row -1; r>-1; r--){
                if(allItems[r] && allItems[r][c]){
                    let cnt = 0;
                    for(let j = r+1; j <row; j++){
                        if(allItems[j] && ! allItems[j][c]) cnt++;
                    }
                    if(cnt){
                        const item = allItems[r][c];
                        item.pos(c,r+cnt);
                        coll.push(renderer.move(item2msg.get(item).pos(item.x, item.y)));
                    }
                }

            }
        }
        if(coll.length) Promise.all(coll).then(_=> this._fillStart());

    }
    _fillStart(){
        const {items, column, row, renderer, item2msg} = this;
        const allItems = [];
        for (let i = row; i--;){allItems.push([])}
        items.forEach(item => (allItems[item.y][item.x] = item));
        const coll = [];
        for(let c = 0; c< column; c++){
            for(let r= row -1; r>-1; r--){
                if(allItems[r] && ! allItems[r][c]){
                    coll.push(this._add(c,r));
                }
            }
        }
        if(!coll.length) return;
        Promise.all(coll.map(item => {
            item.pos(item.x, item.y + row);
            return renderder.move(item2msg.get(item).pos(item.x, item.y));
        })).then(_=>renderer.activate())
    }
}

// sub-renderer = sub view
const ItemRenderer = class{
    get object(){throw 'override';}
    find(v){throw 'override';}
    remove(){return this._remove();}
    move(x, y){return this._move(x, y)}
    render(x, y, type, selected){this._render(x, y, type, selected);}
    _remove(){throw "override";}
    _move(x, y){throw "override"}
    _render(x, y, type, selected) {throw 'override'}
};

// Utils layer
const UTIL = {
    el:v=>document.querySelector(v),
    prop:(...arg) => Object.assign(...arg),
    ThrowSet:class extends Set{
        constructor(){
            super();
        }
        some(f){
            try{
                this.forEach((v, i) =>{
                    if(v = f(v,i)) throw v;
                });
            }catch(r){
                return r;
            }
        }
    }
};

// view == renderer
const Renderer = class extends ThrowSet{
    constructor(itemFactory){
        super();
        // msg == game, item == ItemRenderer
        prop(this, {_itemFactory:itemFactory, msg2item:new WeakMap, item2msg: new WeakMap});
    }
    setGame(_game, _row, _col) {prop(this, {_game, _row, _col});}
    activate(){throw 'override';}
    deactivate(){throw 'override';}

    add(msg){
        const {msg2item, item2msg, _itemFactory} = this;
        const item = _itemFactory(this, this.bw, this.bh, this.img);
        super.add(item);
        msg2item.set(msg, item);
        item2msg.set(item, msg);
        this._add(item);
    }

    _add(v){throw 'override'};

    remove(msgs){
        if(!msgs.length) return;
        const {msg2item} = this;
        return Promise.all(msgs.map(msg=>{
            const item = msg2item.get(msg);
            msg2item.delete(msg);
            this._delete(item);
            return item.remove();
        }));
    }

    _delete(item){
        this.item2msg.delete(item);
        super.delete(item);
        this._remove(item);
    }
    _remove(item){throw 'override';}
    move(msg){
        const {x, y} = msg.pos();
        return this.msg2item.get(msg).move(x,y);
    }

    itemStart(item){this._gameRequest(this._game.selectStart, item);}
    itemNext(item){this._gameRequest(this._game.selectNext, item);}
    itemEnd(){this._gameRequest(this._game.selectEnd);}
    _gameRequest(f, item){
        const {_game:game, item2msg} = this;
        if(item) f.call(game, item2msg.get(item));
        else f.call(game);
    }
    _renderLoop(){
        const {_game:game, item2msg} = this;
        this.forEach(item=>{
            const {x, y, type, selected} = game.getInfo(item2msg.get(v)).info();
            item.render(x, y, type, selected);
        });
        this._render();
    }
    _render(){throw 'override'}
}


// 구상 renderer : dealing with native code
const DivRenderer = class extends ItemRenderer{
    constructor(_parent, bw, bh, img){
        prop(this, {_parent, img, bw, bh, div});
        const div = el('div');
        div.className = 'block';
        div.style.cssText = `width:${bw}px; height:${bh}px;backgroundImage:url(${img})`;
    }
    get object(){return this.div;}
    find(el){return el== this.div;}
    _remove(){
        const {div, _parent:parent} = this;
        return new Promise((resolve, reject)=>{
            div.style.transaction = "transform ease-in 350ms";
            div.style.transform = "scale(0,0)";
            parent.delayTask(resolve, 350);
        });
    }
    _move(x, y){
        const {div, bw, bh, _parent:parent} = this;
        return new Promise((resolve, reject)=>{
            const time = (y* bh - parseInt(div.style.top))/ bh * 100;
            div.style.transition = `top ease-in ${time}ms`;
            parent.delayTask(resolve, time);
        });
    }
    _render(x, y, type, selected){
        const {div, bw, bh, img} = this;
        div.style.left = bw * x + "px";
        div.style.top = bh * y + "px";
        div.style.backgroundPosition = -(bw * type) + "px";
        div.style.backgroundPositionY = (selected ? -bh: 0) + "px";
    }
}

const SectionRenderer = class extends Renderer{

}
