$(function () {
    "use strict";

    var hiddenCards = $('.card-hidden');
    var hiddenMusic = $('.music-hidden');
    var cards = $('.card');
    var cardsImg = $('.card-img');
    var selectCount = 0;
    var lastCardNum;
    var lastCardImg;
    var saveSltCards = [];
    var pictures = [
        ['pic_0.png', 0], ['pic_1.png', 0], ['pic_2.png', 0],
        ['pic_3.png', 0], ['pic_4.png', 0], ['pic_5.png', 0]
    ];
    var musicList =  [
        ['Pa0NfMzqWKr80xUY_N', 0], ['5-DvgYA-i4L5qMK_rn', 0], ['4r3Bvo-gSSJLo_1gTa', 0],
        ['KlRl51CoBZNAA1LNDi', 0], ['8p2Kxkf72c2elKV27S', 0], ['OqUuRN7fMMmVdincde', 0]
    ];

    // 牌寬度動態調整
    function cardResizeHandler() {
        var cWidth = cards.width();

        cards.css({
            'line-height': cWidth * 0.92 + 'px',
            'font-size': (cWidth - 30) + 'px'
        }).height(cWidth * 1.42);
    }

    // 將隱藏牌組的圖片替換
    async function setCardsImage() {
        for (let i = 0; i < hiddenCards.length; i++) {
            var card = $(hiddenCards[i]);
            var music = $(hiddenMusic[i]);

            await setRandomImage(card, music);
        }    
    }

    // 隨機設置圖片（每一種照片各兩張）
    function setRandomImage(pic, music) {
        var x = Math.floor((Math.random() * 6));

        if (pictures[x][1] < 2) {
            pic.attr('src', 'images/' + pictures[x][0]);
            pic.attr('data-src', 'https://widget.kkbox.com/v1/?id=' + musicList[x][0] + '&type=song&terr=TW&lang=JA&autoplay=true');
            pictures[x][1]++;

            return pictures[x];
        } 

        setRandomImage(pic, music);
    } 

    // 每次只能選兩張比對，選了兩張之後計數器歸零
    function reSetSltCards() {
        selectCount = 0;
        saveSltCards = [];
        lastCardNum = '';
    }

    cardsImg.click(function (e) {
        var $this = $(this);

        // 點同張牌則直接返回，不計數與暫存
        if ($this.data('i') === lastCardNum) {
            console.log('點了同張牌');
            return;
        }

        // 點了已翻開的牌直接返回，不計數與暫存
        if ($this.attr('src') !== 'images/pic_c.png') {
            console.log('點了已翻牌');
            return;
        }

        // >= 2 表示選取到不同花色的牌延遲中尚未歸零，直接返回
        if (selectCount >= 2) {
            return;
        }

        // 暫存目前所選取的牌
        saveSltCards.push($this);

        if (selectCount < 2) {
            var hCard = $('[data-j="' + $this.data('i') + '"]');
            var hMusic = $('[data-k="' + $this.data('i') + '"]');

            // 翻出目前選取的牌色
            $this.attr('src', hCard.attr('src'));
            lastCardNum = $this.data('i');

            // 播放音樂
            hMusic.attr('src', hCard.data('src'));

            selectCount++;
        }

        // 選了兩張牌後
        if (selectCount >= 2) {
            // 如果選到的牌花色不同，則蓋上選取的兩張牌
            if ($this.attr('src') === lastCardImg) {
                reSetSltCards();

                console.log('- 選到相同花色 -');
            } else {
                setTimeout(function () {
                    saveSltCards.forEach(function (c) {
                        c.attr('src', 'images/pic_c.png');
                    });
                    reSetSltCards();
                }, 30000);

                console.log('- 選到不同花色 -');
            }
        }

        lastCardImg = $this.attr('src');
    });

    $('#btnStart').click(function (e) {
        var $this = $(this);

        $this.html('重新洗牌');

        // 重置 pictures 裡的數值，刷新遊戲
        for (let i = 0; i < pictures.length; i++) {
            pictures[i][1] = 0;
        }

        cardsImg.attr('src', 'images/pic_c.png');

        setCardsImage();
    });

    $(window).resize(cardResizeHandler);
    cardResizeHandler();
});