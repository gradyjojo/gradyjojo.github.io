const animationTimeline = () => {

    const textboxChars = document.getElementsByClassName('textbox_chat')[0];
    textboxChars.innerHTML = `<span>${textboxChars.innerHTML
        .split('')
        .join('</span><span>')}</span>`

    const ideaTextTrans = {
        opacity: 0,
        y: -20,
        rotationX: 5,
        skewX: '15deg'
    }

    const ideaTextTransLeave = {
        opacity: 0,
        y: 20,
        rotationY: 5,
        skewX: '-15deg'
    }

    const tl = new TimelineMax();

    tl.to('.container', 0.6, {
        visibility: 'visible'
    })
    .from('.one', 0.7, {
        opacity: 0,
        y: 10
    })
    .from('.two', 0.4, {
        opacity: 0,
        y: 10
    })
    .to('.one', 0.7, {
        opacity: 0,
        y: 10
    }, '+=3')
    .to('.two', 0.7, {
        opacity: 0,
        y: 10
    }, '-=1')

    .from('.three', 0.7, {
        opacity: 0,
        y: 10
    })
    .to('.three', 0.7, {
        opacity: 0,
        y: 10
    }, '+=3')

    .from('.four', 0.7, {
        opacity: 0,
        scale: 0.2
    })
    .from('.fake_button', 0.3, {
        opacity: 0,
        scale: 0.2
    })
    .staggerTo('.textbox_chat span', 1.5, {
        visibility: 'visible'
    }, 0.05)
    .to('.fake_button', 0.1, {
        backgroundColor: 'rgb(127, 206, 248)'
    }, '+=4')
    .to('.four', 0.5, {
        opacity: 0,
        scale: 0.2,
        y: -150
    }, '+=1')

    .from('.idea_1', 0.7, ideaTextTrans)
    .to('.idea_1', 0.7, ideaTextTransLeave, '+=2.5')

    .from('.idea_2', 0.7, ideaTextTrans)
    .to('.idea_2', 0.7, ideaTextTransLeave, '+=2.5')

    .from('.idea_3', 0.7, ideaTextTrans)
    .to('.idea_3', 0.7, ideaTextTransLeave, '+=2.5')

    .from('.idea_4', 0.7, ideaTextTrans)
    .to('.idea_4', 0.7, ideaTextTransLeave, '+=2.5')

    .from('.idea_5', 0.7, ideaTextTrans)
    .to('.idea_5', 0.7, ideaTextTransLeave, '+=2.5')

    .from('.six', {
        opacity: 0,
        y: 10
    })
}

animationTimeline();