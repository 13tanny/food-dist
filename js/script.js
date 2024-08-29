window.addEventListener('DOMContentLoaded', function() {

    // Tabs
    
	let tabs = document.querySelectorAll('.tabheader__item'),
		tabsContent = document.querySelectorAll('.tabcontent'),
		tabsParent = document.querySelector('.tabheader__items')

	function hideTabContent() {
        
        tabsContent.forEach(item => {
            item.classList.add('hide')
            item.classList.remove('show', 'fade')
        })

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active')
        })
	}

	function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade')
        tabsContent[i].classList.remove('hide')
        tabs[i].classList.add('tabheader__item_active')
    }
    
    hideTabContent()
    showTabContent()

	tabsParent.addEventListener('click', function(event) {
		const target = event.target
		if(target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if (target == item) {
                    hideTabContent()
                    showTabContent(i)
                }
            })
		}
    })
    
    // Timer

    const deadline = '2024-05-11'

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
            days = Math.floor( (t/(1000*60*60*24)) ),
            seconds = Math.floor( (t/1000) % 60 ),
            minutes = Math.floor( (t/1000/60) % 60 ),
            hours = Math.floor( (t/(1000*60*60) % 24) )

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        }
    }

    function getZero(num){
        if (num >= 0 && num < 10) { 
            return '0' + num
        } else {
            return num
        }
    }

    function setClock(selector, endtime) {

        const timer = document.querySelector(selector),
            days = timer.querySelector("#days"),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000)

        updateClock()

        function updateClock() {
            const t = getTimeRemaining(endtime)

            days.innerHTML = getZero(t.days)
            hours.innerHTML = getZero(t.hours)
            minutes.innerHTML = getZero(t.minutes)
            seconds.innerHTML = getZero(t.seconds)

            if (t.total <= 0) {
                clearInterval(timeInterval)
            }
        }
    }

    setClock('.timer', deadline)

    // Modal

    const modalTrigger = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal')
        
    modalTrigger.forEach(btn => {
        btn.addEventListener('click', openModal)
    })

    function closeModal() {
        modal.classList.add('hide')
        modal.classList.remove('show')
        document.body.style.overflow = ''
    }

    function openModal() {
        modal.classList.add('show')
        modal.classList.remove('hide')
        document.body.style.overflow = 'hidden'
        clearInterval(modalTimerId)
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.getAttribute('data-close') == '') {
            closeModal()
        }
    })

    document.addEventListener('keydown', (e) => {
        if (e.code === "Escape" && modal.classList.contains('show')) { 
            closeModal()
        }
    })

    const modalTimerId = setTimeout(openModal, 500000)
    // Изменил значение, чтобы не отвлекало

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal()
            window.removeEventListener('scroll', showModalByScroll)
        }
    }
    window.addEventListener('scroll', showModalByScroll)

    // Используем классы для создание карточек меню

    class MenuCard {
        constructor(src, alt, title, descr, price, parentSelector, ...classes) {
            this.src = src
            this.alt = alt
            this.title = title
            this.descr = descr
            this.price = price
            this.classes = classes
            this.parent = document.querySelector(parentSelector)
            this.transfer = 27
            this.changeToUAH()
        }

        changeToUAH() {
            this.price = this.price * this.transfer
        }

        render() {
            const element = document.createElement('div')

            if (this.classes.length === 0) {
                this.classes = "menu__item"
                element.classList.add(this.classes)
            } else {
                this.classes.forEach(className => element.classList.add(className))
            }

            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            `
            this.parent.append(element)
        }
    }

    const getResourse = async (url) => {
        const res = await fetch(url)

        if (!res.ok) {
            throw new Error(`Cuoud not fethc ${url}, status: ${res.status}`)
        }

        return await res.json()
    }

    getResourse('http://localhost:3000/menu')
        .then(data =>{
            data.forEach(({img, altimg, title, descr, price})=> {
                new MenuCard(img, altimg, title, descr, price, '.menu .container').render()
            })
        })

    // Forms
//! каждый раз при измениениях (когда мы работаем с формой и локальным сервером
//! нужно збрасыввать кеш. Комбинация клавиш (command + shift + R)

    const forms = document.querySelectorAll('form')

    const messaqe = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так...'
    }

    forms.forEach(item => {
        bindPostData (item)
    })
    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        })

        return await res.json()
    }

    function bindPostData (form) {
        console.log('listener')
        form.addEventListener('submit', (e) => {
            console.log('submit')
            e.preventDefault();

            const statusMessage = document.createElement('img')
            statusMessage.src = messaqe.loading
            statusMessage.style.cssText =  `
                display: block;
                margin: 0 auto
            `

            form.insertAdjacentElement('afterend', statusMessage)

            const formData = new FormData(form)

            const json = JSON.stringify(Object.fromEntries(formData.entries()))

            postData('http://localhost:3000/requests', json)
            .then(data => {
                console.log(data)
                showThanksModal(messaqe.success) 
                form.reset()                    
                statusMessage.remove() 
            }).catch(() => {
                showThanksModal(messaqe.failure) 
            }).finally(() => {
                form.reset()
            })
        })
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog')

        prevModalDialog.classList.add('hide')
        openModal()

        const thanksModal = document.createElement('div')
        thanksModal.classList.add('modal__dialog')
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">${message}</div>
            </div>
        `
        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    // fetch('http://localhost:3000/menu')
    //     .then(data => data.json())
    //     .then(res => console.log(res))

    //! команда для запуска ---- npx json-server db.json --- в терминале
// Slider   
    const slides = document.querySelectorAll('.offer__slide'),
        slider = document.querySelector('.offer__slider'),
        prev = document.querySelector('.offer__slider-prev'),
        next = document.querySelector('.offer__slider-next'),
        total = document.querySelector('#total'),
        current = document.querySelector('#current'),
        slidesWrapper = document.querySelector('.offer__slider-wrapper'),
        slidesField = document.querySelector('.offer__slider-inner'),
        width = window.getComputedStyle(slidesWrapper).width;

    let slideIndex = 1
    let offset = 0

    if (slides.length < 10) {
        total.textContent = `0${slides.length}`
        current.textContent = `0${slideIndex}`
    } else {
        total.textContent = slides.length
        current.textContent = `${slideIndex}`
    }

    slidesField.style.width = 100 * slides.length + '%'
    slidesField.style.display = 'flex'
    slidesField.style.transition = '0.5s all'

    slidesWrapper.style.overflow = 'hidden'

    slides.forEach(slide => {
        slide.style.width = width
    })

    //
    slider.style.position = 'relative'

    const indicators = document.createElement('ol'),
        dots = []

    indicators.classList.add('carousel-indicators')
    indicators.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 15;
        display: flex;
        justify-content: center;
        margin-right: 15%;
        margin-left: 15%;
        list-style: none;
    `
    slider.append(indicators)

    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.style.cssText = `
            box-sizing: content-box;
            flex: 0 1 auto;
            width: 30px;
            height: 6px;
            margin-right: 3px;
            margin-left: 3px;
            cursor: pointer;
            background-color: #fff;
            background-clip: padding-box;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            opacity: .5;
            transition: opacity .6s ease;
        `
        if (i == 0) {
            dot.style.opacity = 1
        }

        indicators.append(dot)
        dots.push(dot)
    }
    //
    // function deleteNotDigits(str) {
    //     return +str.replace(/\D/g, '')
    // }

    next.addEventListener('click', () => {
        const widthValue = parseInt(width, 10)

        if (offset == widthValue * (slides.length - 1)) {
            offset = 0
        } else {
            offset += widthValue
        }

        slidesField.style.transform = `translateX(-${offset}px)`

        if (slideIndex == slides.length) {
            slideIndex = 1
        } else {
            slideIndex++
        }

        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`
        } else {
            current.textContent = slideIndex
        }

        dots.forEach(dot => dot.style.opacity = '.5')
        dots[slideIndex - 1].style.opacity = 1
    })

    prev.addEventListener('click', () => {
        const widthValue = parseInt(width, 10)
        if (offset == 0) {
            offset = widthValue * (slides.length - 1)
        } else {
            offset -= widthValue
        }

        slidesField.style.transform = `translateX(-${offset}px)`

        if (slideIndex == 1) {
            slideIndex = slides.length
        } else {
            slideIndex--
        }

        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`
        } else {
            current.textContent = slideIndex
        }

        dots.forEach(dot => dot.style.opacity = '.5')
        dots[slideIndex - 1].style.opacity = 1
    });

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideTo = e.target.getAttribute('data-slide-to')
            slideIndex = parseInt(slideTo, 10)
            offset = parseInt(width, 10) * (slideIndex - 1)

            slidesField.style.transform = `translateX(-${offset}px)`

            if (slides.length < 10) {
                current.textContent = `0${slideIndex}`
            } else {
                current.textContent = slideIndex
            }

            dots.forEach(dot => dot.style.opacity = '.5')
            dots[slideIndex - 1].style.opacity = 1
        })
    })    

    // Calculator

    const maleButton = document.querySelector('#male')
    const femaleButton = document.querySelector('#female')
    const weightInput = document.querySelector('#weight')
    const heightInput = document.querySelector('#height')
    const ageInput = document.querySelector('#age')
    const ratioParent = document.querySelector('.calculating__choose_big')
    const resultElement = document.querySelector('.calculating__result span')

    let gender = 'female'
    let weight = null
    let height = null
    let age = null
    let ratio = 1.375
    let result = 0

    maleButton.addEventListener('click', () => {
        gender = 'male'

        renderGender('male')

        calc()
        render()

        localStorage.setItem('gender', gender)
    })

    femaleButton.addEventListener('click', () => {
        gender = 'female'

        renderGender('female')

        calc()
        render()

        localStorage.setItem('gender', gender)
    })

    weightInput.addEventListener('input', (event) => {
        weight = +event.target.value

        calc()
        render()
    })
    heightInput.addEventListener('input', (event) => {
        height = +event.target.value

        calc()
        render()
    })
    ageInput.addEventListener('input', (event) => {
        age = +event.target.value

        calc()
        render()
    })
    ratioParent.addEventListener('click', setRatio)

    function setRatio(event) {
        if (!event.target.classList.contains('calculating__choose-item')) {
            return
        }

        ratio = +event.target.getAttribute('data-ratio')

        renderRatio()
        calc()
        render()

        localStorage.setItem('ratio', ratio)
    }

    function renderRatio() {
        const buttons = document.querySelectorAll('.calculating__choose_big [data-ratio]')

        buttons.forEach((el) => {
            el.classList.remove('calculating__choose-item_active')
        })

        const current = document.querySelector(`[data-ratio="${ ratio }"]`)
        current.classList.add('calculating__choose-item_active')
    }

    function renderGender(gender) {
        if (gender === 'male') {
            femaleButton.classList.remove('calculating__choose-item_active')
            maleButton.classList.add('calculating__choose-item_active')
        } else {
            maleButton.classList.remove('calculating__choose-item_active')
            femaleButton.classList.add('calculating__choose-item_active')
        }
    }

    function calc() {
        if (!age || !weight || !height) return

        if (gender === 'female') {
            result = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio)
        } else {
            result = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio)
        }
    }

    function render() {
        if (!age || !weight || !height) return
         
        resultElement.textContent = result   
    }

    function setInitialData() {
        const storageGender = localStorage.getItem('gender')
        const storageRatio = localStorage.getItem('ratio')

        if (storageGender) {
            gender = storageGender
            renderGender(gender)
        }

        if (storageRatio) {
            ratio = storageRatio
            renderRatio()
        }
    }

    setInitialData()
})

