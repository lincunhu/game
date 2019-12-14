//将整个区域当做表格
var sw = 20,//方块的宽
    sh = 20,//方块的高
    tr = 30,//行数
    td = 30;//列数
var snake = null,//蛇实例
    food = null,//苹果实例
    game = null;//游戏实例

function Square(x, y, classname) { //方块的属性
    this.x = x * sw;//行数，传入的参数乘上宽度，初始宽度为20px，即为一行
    this.y = y * sh;//列数
    this.class = classname;

    this.viewContent = document.createElement("div");
    this.viewContent.className = this.class;
    this.parent = document.getElementById("snakeWrap");
}
Square.prototype.create = function () { //方块的样式方法
    this.viewContent.style.position = "absolute";
    this.viewContent.style.width = sw + "px";
    this.viewContent.style.height = sh + "px";
    this.viewContent.style.left = this.x + "px";
    this.viewContent.style.top = this.y + "px";

    this.parent.appendChild(this.viewContent);//将创建的方块添加到页面
}

Square.prototype.remove = function () { //删除方块
    this.parent.removeChild(this.viewContent);
}

//创建蛇函数
function Snake() {
    this.head = null;//存储蛇头信息
    this.tail = null;//存储蛇尾信息
    this.pos = [];//储存全部蛇身体方块的位置,二维数组,每个元素都对应一身体块的位置
    this.directionNum = {//存储蛇走的方向，按照坐标算
        left: {
            x: -1,
            y: 0,
            rotate: 180//使用c3的transform控制蛇头图片的方向,数字为度数
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }
}
Snake.prototype.init = function () { //init代表初始化的意思,此方法就是初始化页面
    //创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();//添加到页面
    this.head = snakeHead;//存储蛇头信息
    this.pos.push([2, 0]);//存储蛇头位置

    //创建蛇身
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();//添加到页面
    this.pos.push([1, 0]);

    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;//存储蛇尾信息
    this.pos.push([0, 0]);//存储蛇尾位置

    //形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加属性，表示蛇走的方向
    this.direction = this.directionNum.right;//默认向右走
};

//蛇头下一个对应的元素，是继续走、吃到苹果、撞墙、撞自己
Snake.prototype.getNextPos = function () {
    var nextPos = [//蛇头的下一步的坐标
        this.head.x / sw + this.direction.x,//蛇头的x坐标，x坐标存储在this.head的x中，而this.head的x由传入的x参数决定，但是此时的x是已经乘上sw的x，所以要除掉sw
        this.head.y / sh + this.direction.y//this.direction指向directionNum.right，而right中有y
    ]

    //下个点是自己，代表撞到自己，游戏结束
    var selfCollied = false;//默认没撞到自己
    this.pos.forEach(function (value) {//pos存储了整个蛇的所有坐标信息，nextPos存储了下一步的位置坐标，将pos的元素全部拿出与nextPos进行比较
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {//如果有相等的值，说明撞到自己
            selfCollied = true;
        }
    });
    if (selfCollied) {
        console.log("撞到自己了");
        this.strategies.over.call(this);//改变this的指向，当前over()的this为strategies()，将其this改为Snake实例
        return;//阻止代码继续执行
    }

    //下个点是墙，游戏结束
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {/*判断下一步的坐标位置是否小于0，小于就撞到了上边和左边的墙，
                                判断下一步的位置是否大于行数或列数减1（减1是因为初始值是0，而行和列都是30，所以总长度是29），如果大于，就撞到了下边和右边的墙*/
        console.log("撞到墙了");
        this.strategies.over.call(this);
        return;//阻止代码继续执行
    }

    //下个点是苹果
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) { //判断苹果坐标是否存在，以及苹果坐标和蛇头的下一步坐标是否重合
        console.log("吃到苹果");
        this.strategies.eat.call(this);
        return;
    }

    //下个点没有东西，继续走
    this.strategies.move.call(this);//因为不管是撞到什么或者吃到苹果，都会return，阻止代码运行，当代码可以运行到这里时，说明没有return，代表上面的三中情况都没有发生
}

//处理碰撞后的事情
Snake.prototype.strategies = {
    move: function (format) {//参数决定要不要删除蛇尾，当往前走不吃苹果的时候就删除，因为蛇不会变长
        //创建新身体，在旧蛇头的位置
        var newBody = new Square(this.head.x / sw, this.head.y / sh, "snakeBody");//head中的xy传入时就已经乘上20了，所以要除掉
        //更新链表关系
        newBody.next = this.head.next;//将newBody的next设为旧蛇头的next，指向的也就是SnakeBody1
        newBody.next.last = newBody;//此时的newBody.next就指向SnakeBody1，SnakeBody1的last就指向newBody（原本是指向this.head，但是newBody将this.head覆盖掉了）
        newBody.last = null;//这样newBody就排在第一位，last也就是null

        this.head.remove();//将蛇头删除掉
        newBody.create();//为newBody设置样式方法

        //创建新蛇头(位置也就是下一步要走的位置)
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
        //更新链表
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';//因为div的元素是给到viewContent了，所以要在viewContent上面操作style
        newHead.create();

        //更新蛇身方块的坐标位置
        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);/*往pos头上插入新蛇头的坐标，插入到数组最前面，数组方法，
                                                                                                            从0开始，替换0个，插入的坐标*/
        //更新蛇头的信息
        this.head = newHead;

        if (!format) { //判断format，如果为false，就要删除
            this.tail.remove();//将蛇尾信息删除
            this.tail = this.tail.last;//将被删除蛇尾的前一个元素设为蛇尾

            this.pos.pop();//删除数组最后一个

        }
    },
    eat: function () {
        this.strategies.move.call(this, true);//改变this，调用move方法，并且传入true，表示吃到了苹果
        createFood();
        game.score++;
    },
    over: function () {
        // console.log("over");
        game.over();
    }
}

//创建蛇实例
snake = new Snake();

//创建苹果函数
function createFood() {
    //苹果的随机坐标
    var x = null;
    var y = null;

    var include = true;//循环跳出的条件，true表示食物在蛇身上（继续循环），false表示不在（停止循环）
    while (include) {
        //随机出现的坐标位置
        x = Math.round(Math.random() * (td - 1));//随机数(0-1)乘上29(因为从0开始，td为30，所以要减一)，然后取整
        y = Math.round(Math.random() * (tr - 1));

        snake.pos.forEach(function (value) {//对蛇身的坐标进行循环判断
            if (value[0] != x && value[1] != y) {
                include = false;
            }
        });
    }
    //生成苹果
    food = new Square(x, y, 'food');
    food.pos = [x, y];//存储苹果坐标，用于跟蛇头要走的下一个点作对比
    var foodDom = document.querySelector(".food");
    if (foodDom) { //如果food存在于页面中
        foodDom.style.left = x * sw + "px";//这里的x和y是传入的随机坐标，所以乘上20才是真是的像素
        foodDom.style.top = y * sh + "px";
    } else { //如果没有就创建苹果
        food.create();
    }
}

//创建游戏逻辑
function Game() {
    this.timer = null;//改变方向响应时间
    this.score = 0;//得分
}
Game.prototype.init = function () {
    //初始化页面
    snake.init();
    //控制方向
    // snake.getNextPos();
    //调用苹果函数
    createFood();

    document.onkeydown = function (ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) { //按下左键时，并且蛇不是正在往右边走时

            snake.direction = snake.directionNum.left;
            return false;//阻止键盘默认事件

        } else if (ev.which == 38 && snake.direction != snake.directionNum.down) {

            snake.direction = snake.directionNum.up;
            return false;

        } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {

            snake.direction = snake.directionNum.right;
            return false;

        } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {

            snake.direction = snake.directionNum.down;
            return false;
        }
    }
    this.start();
}
Game.prototype.start = function () { //开始游戏
    this.timer = setInterval(function () {
        snake.getNextPos();//下一步的动作
    }, 200)
}

//暂停时调用，清除定时器
Game.prototype.pause = function () {
    clearInterval(this.timer);
}

//游戏失败
Game.prototype.over = function () {
    clearInterval(this.timer);//清除计时器
    alert("游戏失败，分数为" + this.score);

    //回到最初状态
    var snakeWrap = document.getElementById("snakeWrap");
    snakeWrap.innerHTML = "";//将整个游戏界面的元素清空

    snake = new Snake();//重新初始化
    game = new Game();

    var startBtnWrap = document.querySelector(".startBtn");
    startBtnWrap.style.display = "block";//重新显示开始
}

//开启游戏
game = new Game();
var startBtn = document.querySelector(".startBtn button");
startBtn.onclick = function () {
    startBtn.parentNode.style.display = "none";//parentNode找到startBtn的父节点
    game.init();
}

//暂停游戏
var snakeWrap = document.getElementById("snakeWrap");
var pauseBtn = document.querySelector(".pauseBtn button");
snakeWrap.onclick = function () {
    game.pause();//调用暂停方法

    pauseBtn.parentNode.style.display = "block";//打开遮罩层
}
pauseBtn.onclick = function () {
    game.start();//再次执行start
    pauseBtn.parentNode.style.display = "none";//隐藏遮罩层
}





















