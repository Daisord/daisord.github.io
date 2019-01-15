$(() => {
    let musicList = [
        ['Pa0NfMzqWKr80xUY_N', 0], ['5-DvgYA-i4L5qMK_rn', 0], ['4r3Bvo-gSSJLo_1gTa', 0],
        ['KlRl51CoBZNAA1LNDi', 0], ['8p2Kxkf72c2elKV27S', 0], ['OqUuRN7fMMmVdincde', 0]
    ];
    let sltCounter = 0; // 點擊次數計數器
    let sltMusicTemp = []; // 播放音樂的 btn 暫存
    let lastNumTemp; // 前次點擊播放的號碼暫存
    let lastMusicSrcTemp // 前次點擊播放的音樂連結暫存;    

    function setFrameSrc() {
        let player = $('.music-player');

        player.toArray().forEach(async (x) => {
            let frame = $(x);

            await setRandomMusic(frame);
        });

        $('.btn-play').show();
    }

    function setRandomMusic(frame) {
        let num = Math.floor((Math.random() * 6));

        if (musicList[num][1] < 2) {
            frame.attr('data-src', 'https://widget.kkbox.com/v1/?id=' + musicList[num][0] + '&type=song&terr=TW&lang=JA&autoplay=true');
            musicList[num][1]++;
            return;
        }

        setRandomMusic(frame);
    }

    // 清除播放紀錄暫存
    function refreshTemp() {
        sltCounter = 0;
        sltMusicTemp = [];
        lastNumTemp = undefined;

        console.log('刷新暫存');
    }

    async function setBtnRecovery() {
        await sltMusicTemp.forEach((x) => {
            if (x.data('state') !== 1) {
                x.removeClass('btn-primary');
                x.addClass('btn-dark');                     
            }
        });
    }

    function setBtnComplete() {

    }

    $('.btn-play').on('click', function () {
        let btn = $(this);
        let num = btn.data('num');
        let state = btn.data('state');
        let frame = $('.music-player[data-num="' + num + '"]');

        console.log('點擊第 ' + num + ' 首音樂');

        // 點了同一首音樂則直接返回，不計數與暫存
        if (num === lastNumTemp) {
            console.log('點了同一首音樂');
            console.log('停止播放');
            return;
        }

        // 點了已配對完成的音樂則直接返回，不計數與暫存
        if (state === 1) {
            console.log('點了完成配對的音樂');
            return;
        }

        // >= 2 表示點到不同音樂但尚未播放停止，直接返回
        if (sltCounter >= 2) {
            return;
        }

        // 暫存目前點擊播放的音樂
        sltMusicTemp.push(btn);

        // 點擊播放一首音樂
        if (sltCounter < 2) {
            // 連接播放歌曲的 KKBOX Widget 頁面
            frame.attr('src', frame.data('src'));

            lastNumTemp = num;
            sltCounter++;

            btn.html('停止');
            btn.removeClass('btn-dark');
            btn.addClass('btn-primary');            

            // 撥放 10 秒後連結到空白頁關閉 KKBOX Widget 頁面
            setTimeout(() => {
                frame.attr('src', 'about:blank');

                // 若尚未屬於完成狀態則復原可播放狀態
                if (btn.data('state') !== 1) {
                    btn.html('播放');   
                }  

                // 點擊播放兩首後
                if (sltCounter >= 2) {
                    // 於第二首播放結束時自動刷新
                    setBtnRecovery();
                    refreshTemp();
                }              
            }, 10000);
        }

        // 播放兩首歌曲後
        if (sltCounter >= 2) {
            // 播放的歌曲配對成功
            if (frame.data('src') === lastMusicSrcTemp) {
                sltMusicTemp.forEach((x) => {
                    x.html('完成');
                    x.data('state', 1);
                });
                console.log('歌曲配對成功');
            } else {
                console.log('歌曲配對失敗');
            }
        }

        lastMusicSrcTemp = frame.data('src');
    });

    setFrameSrc();
});