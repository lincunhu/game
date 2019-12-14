//构建函数属性
function Mine(tr, td, mineNum) {
    this.tr = tr;//行数
    this.td = td;//列数
    this.mineNum = mineNum;//雷的数量

    this.sqaures = [];//储存所有格子的信息，以行和列的形式表示，二维数组
    this.tds = [];//存储所有的格子的dom，二维数组
    this.surpluaMine = mineNum;//剩余雷的数量
    this.allRight = false;//标记的小红旗是否全是雷，判断用户是否游戏成功

    this.parent = document.querySelector('.gameBox');//主体
}

//随机排序，雷的位置
Mine.prototype.randomNum = function () {
    var square = new Array(this.tr * this.td);//生成一个空数组，但是有长度，，创建数组时，给Array传入参数，就是数组的长度
    for (var i = 0; i < square.length; i++) {
        square[i] = i;//把数组的长度放到数组中作为下标
    }
    square.sort(function () {//重新排序
        return 0.5 - Math.random();//出现一个（0.5,-0.5）的随机数
    });

    return square.slice(0, this.mineNum);//取出传入的雷的个数
}

//确定是雷还是数字
Mine.prototype.init = function () {
    var rn = this.randomNum();//雷在格子中的的位置
    var n = 0;//用来找到格子对应的索引

    for (var i = 0; i < this.tr; i++) {
        this.sqaures[i] = [];
        for (var j = 0; j < this.tr; j++) {
            // this.sqaures[i][j] = ;
            n++;
            //在table中找一个方块，以行和列的形式去找，找方块的周围的东西时，以坐标的形式去找，行和列的x，y与坐标的x，y是相反的
            if (rn.indexOf(n) != -1) { //判断当前格子的索引，是否在雷随机数组里找到了，如果没找到就返回-1，如果!=-1,就是个雷，
                this.sqaures[i][j] = { type: 'mine', x: j, y: i };//因为行和列的x，y与坐标的x，y是相反的，所以将j对应x
            } else {
                this.sqaures[i][j] = { type: 'number', x: j, y: i, value: 0 };
            }
        }
    }
    //阻止鼠标右键默认事件
    this.parent.oncontextmenu = function () {
        return false;
    }


    //调用方法
    this.updataNum();
    this.createDom();

    //显示剩余雷数
    this.mineDom = document.querySelector(".mineNum");
    this.mineDom.innerHTML = this.surpluaMine;

}

//构建函数原型，方法，创建表格
Mine.prototype.createDom = function () {
    var This = this;
    var table = document.createElement("table");

    for (var i = 0; i < this.tr; i++) { //行
        var domTr = document.createElement("tr");
        this.tds[i] = [];//在tds数组内部，再创建一个数组

        for (var j = 0; j < this.td; j++) {//列 
            var domTd = document.createElement("td");
            // domTd.innerHTML = 0;

            domTd.pos = [i, j];//把格子对应的行列存到格子本身，可以通过这个值取到数组里对应的数据
            //给单元格添加点击事件，点击时出现数字或雷
            domTd.onmousedown = function () { //这个this指向domTd
                This.play(event, this);//因为this不同，所以使用被赋值的This
            }

            this.tds[i][j] = domTd;//把所有td添加到数组中，因为到这里时，才有domTd这个完整的单元格
            // if (this.sqaures[i][j].type == "mine") { //判断是否是雷，如果是给它添加样式
            //     domTd.className = "mine";
            // }
            // if (this.sqaures[i][j].type == "number") {
            //     domTd.innerHTML = this.sqaures[i][j].value;
            // }

            domTr.appendChild(domTd);//将td添加到tr中
        }

        table.appendChild(domTr);//将tr添加到table
    }
    this.parent.innerHTML = '';//将上一次创建的内容清空
    this.parent.appendChild(table);//添加到页面
}

//找某个格子或者雷周围的格子
Mine.prototype.getAround = function (square) {//找格子使用的是坐标，不是行列
    var x = square.x;
    var y = square.y;
    var result = [];//二维数组，储存找到的格子坐标

    /*
        x-1,y-1  x,y-1   x+1,y-1
        x-1,y    x,y     x+1,y
        x-1,y+1  x+1,y+1   x+1,y+1
    */
    //通过坐标循环九宫格
    for (var i = x - 1; i <= x + 1; i++) { //用坐标寻找，这里的i，j是坐标
        for (var j = y - 1; j <= y + 1; j++) {
            if (i < 0 ||//格子超出左边范围
                j < 0 ||//格子超出了上边范围
                i > this.td - 1 ||//格子超出了右边的范围
                j > this.tr - 1 ||//格子超出了下边的范围
                (i == x && j == y) ||//坐标是自身
                this.sqaures[j][i].type == "mine"//找到的格子是雷,这里要写[j][i]，因为sqaures存放的是行列，与坐标相反
            ) {
                continue;//跳出循环
            }

            result.push([j, i]);
        }
    }

    return result;
}

//更新所有数字
Mine.prototype.updataNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            //只更新雷周围的数字
            if (this.sqaures[i][j].type == "number") {
                continue;
            }

            var num = this.getAround(this.sqaures[i][j]);//获取每一个雷周围的数字,传入的是一个雷
            for (var k = 0; k < num.length; k++) {
                /*
                    num[i] = [0, 1]  num[i]是二维数组
                    num[i][0] = 0
                    num[i][1] = 1
                */
                this.sqaures[num[k][0]][num[k][1]].value += 1;
            }

        }
    }
    // console.log(this.sqaures);
}

//
Mine.prototype.play = function (ev, obj) {
    var This = this;
    if (ev.which == 1 && obj.className != "flag") { //点击左键，后面的条件是用户标完红旗后就不能左键点击，当obj的className不为flag时，说明没标记红旗
        //拿到点击的格子数据
        var curSquare = this.sqaures[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eigth'];

        if (curSquare.type == "number") {//点到的是数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];


            if (curSquare.value == 0) { //点到了数字0
                /*
                    点到了数字
                        1.显示自己
                        2.找四周
                            1.显示四周（如果四周的值不为0，就停止寻找）
                            2.如果为0
                                1.显示自己
                                2.找四周（如果四周不为0，就停止寻找）
                                    1.显示自己
                                    2.找四周（如果四周不为0，就停止寻找）
                */
                obj.innerHTML = "";

                //使用递归
                function getAllZero(square) {
                    var aorund = This.getAround(square);//找到周围的格子

                    for (var i = 0; i < aorund.length; i++) { //拿到周围格子的行列
                        var x = aorund[i][0];
                        var y = aorund[i][1];

                        This.tds[x][y].className = cl[This.sqaures[x][y].value];//将格子的value作为下标，覆盖样式

                        if (This.sqaures[x][y].value == 0) { //进行递归的条件，当格子的value为0时

                            if (!This.tds[x][y].check) { //给格子添加一个check属性，并判断为非时才进入递归，说明格子没有被循环过

                                This.tds[x][y].check = true;//进入之后，将check设为true，说明已经循环过了，下次不会再进入这里了，也就不会调用了

                                getAllZero(This.sqaures[x][y]);//以格子的数据作为传入的参数，开始递归
                            }
                        } else { //递归时，格子的value不为0
                            This.tds[x][y].innerHTML = This.sqaures[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        } else { //点到的是雷
            this.gameOver(obj);
        }
    }
    if (ev.which == 3) { //点击了右键
        if (obj.className && obj.className != "flag") { //（obj是已经显示出来的）说明点击的是一个数字，有className并且不为flag，证明是一个数字
            return;
        }
        obj.className = obj.className == "flag" ? "" : "flag";//切换className，如果点击的obj上没有flag，则给一个，有了就去掉

        if (this.sqaures[obj.pos[0]][obj.pos[1]].type == "mine") { //判断标记的红旗是否全都是雷
            this.allRight = true;
        } else {
            this.allRight = false;
        }

        if (obj.className == "flag") { //对显示雷的数字进行改变
            this.mineDom.innerHTML = --this.surpluaMine;//每标记一个红旗，就认为找的了一个雷，待找的雷数就自减
        } else {
            this.mineDom.innerHTML = ++this.surpluaMine;//取消掉一个雷，就自增
        }
    }
    if (this.surpluaMine == 0) { //用户标完了小红旗
        if (this.allRight) {//用户标记的全部都是雷 
            alert("游戏成功");
        } else {
            alert("游戏失败");
            this.gameOver();//不用传参，因为并没有点击雷，而是将所有红旗标完了，但是同样失败了
        }
    }
}

//游戏失败函数
Mine.prototype.gameOver = function (clickTd) {
    /*
        1.显示所有的雷
        2.取消所有格子的点击事件
        3.给点到的雷标红
    */
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.sqaures[i][j].type == "mine") {
                this.tds[i][j].className = "mine";
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    if (clickTd) {
        clickTd.style.backgroundColor = "#f00";
        alert("游戏失败");
    }
}

//button的功能
var btns = document.querySelectorAll('.level button');
var mine = null;//储存生成的实例
var ln = 0;//处理当前选中的状态
var arr = [[9, 9, 10], [16, 16, 40], [28, 28, 99]];//不同级别的行列和雷的数量

for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function () {
        btns[ln].className = '';
        this.className = 'active';

        mine = new Mine(...arr[i]);//ES6语法，直接选取二维数组中的值
        mine.init();

        ln = i;
    }
}
btns[0].onclick();//主动调用事件
btns[3].onclick = function () {//重新开始，重新调用init()
    mine.init();
}