/**
 * 步骤提示插架 steps
 * Author: chengzan
 * CreateTime: 2020-1-23 17:10
 * Version: 1.0.001
 * */
;(function (global, fn ,plugin) {
    global[plugin] = fn.call(global);
})(window, function () {
    // 绑定的元素，元素的子元素对应tips配置和内容
    let _stepsBindEl;
    // callback
    let _cb;
    // 滚动定时器
    let timer;

    // 获取元素位置和宽高信息
    function _getElInfo(el) {
        return {
            width: el.offsetWidth,
            height: el.offsetHeight,
            left: el.offsetLeft,
            top: el.offsetTop,
        };
    }

    // 获取需要滚动的距离
    function scrollToEl(el) {
        const innerHeight = window.innerHeight;
        // steps 的元素信息，宽、高、据顶、距底部位置
        let elPositionInfo = _getElInfo(el);
        let scrollTop = 0;
        if (elPositionInfo.top > innerHeight) {
            scrollTop = elPositionInfo.top - innerHeight + elPositionInfo.height + 20;
        }

        // 如果元素位置在首屏之外，那么就滚动到元素位置
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            let now = document.documentElement.scrollTop;
            let speed = (scrollTop - now) / 10;
            speed = speed < 0 ? Math.ceil(speed) : Math.floor(speed);
            scrollToEl(el);
            if(now === scrollTop || speed === 0) {
                clearTimeout(timer);
            }
            document.body.scrollTop += speed;
            document.documentElement.scrollTop += speed;
        }, 25)
    }

    // 组装步骤显示元素
    function initSteps(els) {
        for (let i = 0; i < els.length; i++) {
            createBox(els[i], i);
        }
        nextIndex(0, els[0]);
    }

    // 创建steps的盒子
    function createBox(el, index) {
        const boxInfo = el.dataset;
        const elPositionInfo = _getElInfo(document.getElementById(boxInfo.bindId));
        // 创建父级，加入boxShadow只显示el的内容
        const parentEl = document.createElement('div');
        parentEl.classList.add('steps-parent', 'steps-hidden');
        if (index === 0) {
            parentEl.classList.remove('steps-hidden');
        }
        parentEl.style.left = `${elPositionInfo.left}px`;
        parentEl.style.width = `300px`;
        parentEl.dataset.index = index;

        // mask 遮罩
        const maskEl = document.createElement('div');
        maskEl.classList.add('steps-mask', 'steps-hidden');
        if (index === 0) {
            maskEl.classList.remove('steps-hidden');
        }
        maskEl.dataset.index = index;
        maskEl.style.top =  `${elPositionInfo.top}px`;
        maskEl.style.left = `${elPositionInfo.left}px`;
        maskEl.style.width = `${elPositionInfo.width}px`;
        maskEl.style.height = `${elPositionInfo.height}px`;
        document.body.appendChild(maskEl);

        // 步骤提示内容
        const contentEl = document.createElement('div');
        contentEl.classList.add('steps-content');
        const childrens = el.children;
        console.log(el.cloneNode(true).childNodes);
        for (let i = 0; i < childrens.length; i++) {
            contentEl.appendChild(childrens[i].cloneNode(true));
        }
        parentEl.appendChild(contentEl);

        // 加入下一步按钮
        const nextButton = document.createElement('button');
        nextButton.classList.add('steps-next');
        if (boxInfo.position === 'top') {
            nextButton.style.marginTop = `-${60}px`;
        } else if (boxInfo.position === 'bottom') {
            nextButton.style.marginTop = `${20}px`;
        }
        nextButton.innerText = _stepsBindEl[0].querySelectorAll('li').length === index + 1 ? '关闭' : '下一步';
        nextButton.addEventListener('click', () => {
            hideSteps(index);
            _cb(index);
            if (index < _stepsBindEl[0].querySelectorAll('li').length - 1) {
                nextIndex(index + 1);
            }
        });
        parentEl.appendChild(nextButton);

        // 加入不再提示按钮
        // const noTipsButton = document.createElement('button');
        // noTipsButton.classList.add('steps-no-tips');
        // noTipsButton.innerText = '不再提示';
        // if (boxInfo.position === 'top') {
        //     noTipsButton.style.marginTop = `-${60}px`;
        // } else if (boxInfo.position === 'bottom') {
        //     noTipsButton.style.marginTop = `${elPositionInfo.height + 20}px`;
        // }
        // noTipsButton.addEventListener('click', hideSteps);
        // parentEl.appendChild(noTipsButton);

        document.body.appendChild(parentEl);
        if (boxInfo.position === 'top') {
            parentEl.style.top =  `${elPositionInfo.top - parentEl.offsetHeight - 20}px`;
        } else if (boxInfo.position === 'bottom') {
            parentEl.style.top =  `${elPositionInfo.top + elPositionInfo.height + 20}px`;
        }
    }

    // 显示steps
    function nextIndex(index) {
        scrollToEl(document.getElementById(_stepsBindEl[0].querySelectorAll('li')[index].dataset.bindId));
        document.getElementsByClassName('steps-parent')[index].classList.remove('steps-hidden');
        document.getElementsByClassName('steps-mask')[index].classList.remove('steps-hidden');
    }

    // 隐藏steps
    function hideSteps(index) {
        document.getElementsByClassName('steps-parent')[index].classList.add('steps-hidden');
        document.getElementsByClassName('steps-mask')[index].classList.add('steps-hidden');
    }

    return {
        bind: function (param, cb, config) {
            _stepsBindEl = document.querySelectorAll(param.el);
            _cb = cb;
            // 首个参数是数组
            if (_stepsBindEl.length === 0) {
                throw Error('Not find id element');
            }
            const els = _stepsBindEl[0].querySelectorAll('li');
            if (els.length > 0) {
                initSteps(els);
            } else {
                throw Error('Not find li element');
            }
        }
    };
}, 'steps');
