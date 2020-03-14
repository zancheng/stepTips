/**
 * 步骤提示插架 steps
 * Author: chengzan
 * UpdateTime: 2020-3-14 17:32
 * Version: 1.0.003
 * */
const steps = (function() {
    // 绑定的元素，元素的子元素对应tips配置和内容
    let _stepsBindEl
    // callback
    let _cb
    // 滚动定时器
    let timer

    // 获取元素位置和宽高信息
    function _getElInfo(el) {
        return {
            width: el.offsetWidth,
            height: el.offsetHeight,
            left: getElementLeft(el),
            top: getElementTop(el),
        }
    }
    // 获取元素左偏移
    function getElementLeft(element) {
        var actualLeft = element.offsetLeft
        var current = element.offsetParent
        while (current !== null) {
            actualLeft += current.offsetLeft + current.clientLeft
            current = current.offsetParent
        }
        return actualLeft
    }
    // 获取元素顶部偏移
    function getElementTop(element) {
        var actualTop = element.offsetTop
        var current = element.offsetParent
        while (current !== null) {
            actualTop += current.offsetTop + current.clientTop
            current = current.offsetParent
        }
        return actualTop
    }
    // 获取需要滚动的距离
    function scrollToEl(el) {
        const innerHeight = window.innerHeight
        // steps 的元素信息，宽、高、据顶、距底部位置
        let elPositionInfo = _getElInfo(el)
        let scrollTop = 0
        if (elPositionInfo.top > innerHeight) {
            scrollTop = elPositionInfo.top - innerHeight + elPositionInfo.height + 20
        }

        // 如果元素位置在首屏之外，那么就滚动到元素位置
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(function() {
            let now = document.body.scrollTop || document.documentElement.scrollTop
            let speed = (scrollTop - now) / 10
            speed = speed < 0 ? Math.ceil(speed) : Math.floor(speed)
            scrollToEl(el)
            if (now === scrollTop || speed === 0) {
                clearTimeout(timer)
            }
            document.body.scrollTop += speed
            document.documentElement.scrollTop += speed
        }, 25)
    }

    // 组装步骤显示元素
    function initSteps(els) {
        for (let i = 0; i < els.length; i++) {
            createBox(els[i], i)
        }
        nextIndex(0, els[0])
        document.body.classList.add('body-no-scroll')
    }

    // 创建steps的盒子
    function createBox(el, index) {
        const boxInfo = el.dataset
        let elPositionInfo
        let contentElement = document.getElementById(boxInfo.bindId) || document.getElementsByClassName(boxInfo.bindClass)[0]
        if (boxInfo.bindId) {
            elPositionInfo = _getElInfo(document.getElementById(boxInfo.bindId))
        } else {
            elPositionInfo = _getElInfo(document.getElementsByClassName(boxInfo.bindClass)[0])
        }
        // 创建父级，加入boxShadow只显示el的内容
        const parentEl = document.createElement('div')
        parentEl.classList.add('steps-parent', 'steps-hidden')
        parentEl.style.left = `${elPositionInfo.left}px`
        parentEl.dataset.index = index

        // mask 遮罩
        const maskEl = document.createElement('div')
        maskEl.classList.add('steps-mask', 'steps-hidden')
        document.body.appendChild(maskEl)
        // 遮挡的内容
        const contentShowEl = document.createElement('div')
        contentShowEl.classList.add('steps-show-content', 'steps-hidden')
        contentShowEl.dataset.index = index
        contentShowEl.style.top = `${elPositionInfo.top}px`
        contentShowEl.style.left = `${elPositionInfo.left}px`
        contentShowEl.style.width = `${elPositionInfo.width}px`
        contentShowEl.style.height = `${elPositionInfo.height}px`
        document.body.appendChild(contentShowEl)

        // 步骤提示内容
        const contentEl = document.createElement('div')
        contentEl.classList.add('steps-content')
        const childrens = el.children
        for (let i = 0; i < childrens.length; i++) {
            contentEl.appendChild(childrens[i].cloneNode(true))
        }
        parentEl.appendChild(contentEl)

        const buttonGroup = document.createElement('div')
        buttonGroup.classList.add('steps-btn-group')
        // 加入下一步按钮
        const nextButton = document.createElement('button')
        nextButton.classList.add('steps-next')
        nextButton.innerText = _stepsBindEl[0].querySelectorAll('li').length === index + 1 ? '关闭' : '下一步'
        nextButton.addEventListener('click', () => {
            hideSteps(index)
            _cb({index: index})
            if (index < _stepsBindEl[0].querySelectorAll('li').length - 1) {
                nextIndex(index + 1)
            } else {
                document.body.classList.remove('body-no-scroll')
            }
            contentElement.classList.remove('steps-show-element')
        })
        buttonGroup.appendChild(nextButton)

        // 加入不再提示按钮
        const noTipsButton = document.createElement('button')
        noTipsButton.classList.add('steps-no-tips')
        noTipsButton.innerText = '不再提示'
        noTipsButton.addEventListener('click', () => {
            hideSteps(index)
            _cb({
                index: index,
                noShow: true
            })
            contentElement.classList.remove('steps-show-element')
            document.body.classList.remove('body-no-scroll')
        })
        buttonGroup.appendChild(noTipsButton)
        parentEl.appendChild(buttonGroup)

        document.body.appendChild(parentEl)
        if (boxInfo.position === 'top') {
            parentEl.style.top = `${elPositionInfo.top - parentEl.offsetHeight}px`
            parentEl.style.left = `${elPositionInfo.left}px`
        } else if (boxInfo.position === 'bottom') {
            parentEl.style.top = `${elPositionInfo.top + elPositionInfo.height}px`
            parentEl.style.left = `${elPositionInfo.left}px`
        } else if (boxInfo.position === 'left') {
            parentEl.style.top = `${elPositionInfo.top}px`
            parentEl.style.left = `${elPositionInfo.left - parentEl.offsetWidth}px`
        } else if (boxInfo.position === 'right') {
            parentEl.style.top = `${elPositionInfo.top}px`
            parentEl.style.left = `${elPositionInfo.left + elPositionInfo.width}px`
        }
        parentEl.dataset.position = boxInfo.position || 'top'
    }

    // 显示steps
    function nextIndex(index) {
        const dataset = _stepsBindEl[0].querySelectorAll('li')[index].dataset
        const showElement = document.getElementById(dataset.bindId) || document.getElementsByClassName(dataset.bindClass)[0];
        [].slice.call(document.getElementsByClassName('steps-show-element')).forEach(e => e.classList.remove('steps-hidden'))
        showElement.classList.add('steps-show-element')
        if (dataset.bindId) {
            scrollToEl(document.getElementById(dataset.bindId))
        } else {
            scrollToEl(document.getElementsByClassName(dataset.bindClass)[0])
        }
        document.getElementsByClassName('steps-parent')[index].classList.remove('steps-hidden')
        document.getElementsByClassName('steps-mask')[index].classList.remove('steps-hidden')
        document.getElementsByClassName('steps-show-content')[index].classList.remove('steps-hidden')
    }

    // 隐藏steps
    function hideSteps(index) {
        document.getElementsByClassName('steps-parent')[index].classList.add('steps-hidden')
        document.getElementsByClassName('steps-mask')[index].classList.add('steps-hidden')
        document.getElementsByClassName('steps-show-content')[index].classList.add('steps-hidden')
    }

    return {
        bind: function(param, cb, config) {
            _stepsBindEl = document.querySelectorAll(param.el)
            _cb = cb
            // 首个参数是数组
            if (_stepsBindEl.length === 0) {
                throw Error('Not find id element')
            }
            const els = _stepsBindEl[0].querySelectorAll('li')
            if (els.length > 0) {
                initSteps(els)
            } else {
                throw Error('Not find li element')
            }
        },
        destroyAll: function() {
            console.log('destroyAll');
            [].slice.call(document.getElementsByClassName('steps-parent')).forEach(e => e.remove());
            [].slice.call(document.getElementsByClassName('steps-mask')).forEach(e => e.remove());
            [].slice.call(document.getElementsByClassName('steps-show-content')).forEach(e => e.remove())
            document.body.classList.remove('body-no-scroll')
        }
    }
})()
