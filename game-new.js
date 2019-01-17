// TODO: 1. 翻牌與播放區分開來
//       2. 遊戲 Table 的切版再調整一下適應手機畫面

$(async () => {
    let musicList = [];
    let sltCounter = 0; // 點擊次數計數器
    let remainderCounter = 6; // 尚未完成的配對計數器
    let sltMusicTemp = []; // 播放音樂的 btn 暫存
    let lastNumTemp; // 前次點擊播放的號碼暫存
    let lastMusicSrcTemp // 前次點擊播放的音樂連結暫存;
    let timeout;

    // 加入排行榜歌單至選單
    await $.ajax({
        url: 'https://api.kkbox.com/v1.1/charts',
        method: 'GET',
        data: {
            territory: 'TW'
        },
        headers: {
            Authorization: 'Bearer duA3r9l4jEhPP8QSxfeaSA=='
        },
        success: (data, textStatus, jqXHR ) => {
            let slt = $('#slt-music-list');
            
            data.data.forEach((x) => {
                slt.append('<option value="' + x.id + '">' + x.title + '</option>');
            });
        },
        error: (jqXHR, textStatus, errorThrown) => {
            alert('發生錯誤');
        }
    });

    // 加入選擇的歌單至遊戲曲目
    $('#btn-add-list').on('click', async function () {
        let slt = $('#slt-music-list');

        await $.ajax({
            url: 'https://api.kkbox.com/v1.1/charts/' + slt.find(':selected').val(),
            method: 'GET',
            data: {
                territory: 'TW'
            },
            headers: {
                Authorization: 'Bearer duA3r9l4jEhPP8QSxfeaSA=='
            },
            success: (data, textStatus, jqXHR ) => {
                for (let idx = 0; idx < 6; idx++) {
                    const x = data.tracks.data[idx];

                    // 檢查是否有重複的單曲 
                    let check = false;
                    musicList.forEach((t) => {
                        if (t.includes(x.id)) {
                            check = true;
                        }
                    });
                    if (check) { continue; }
                    
                    if (musicList.length < 6) {
                        $('#table-music tbody').append(
                            '<tr data-mid="' + x.id + '"><td>' + 
                            '歌手：' + x.album.artist.name + '<br/>' + 
                            '專輯：' + x.album.name + '<br/>' + 
                            '歌名：' + x.name + '</td></tr>'
                        );
                        musicList.push([String(x.id), 0]);
                    }
    
                    // 選取六首後停止增加歌曲
                    if (musicList.length >= 6) {
                        setSettingControllersState();
                        break;
                    }                     
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                alert('發生錯誤');
            }
        });        
    });

    // 搜尋加入音樂
    $('#btn-search').on('click', async function () {
        let mInput = $('#music-input');

        await $.ajax({
            url: 'https://api.kkbox.com/v1.1/search',
            method: 'GET',
            data: {
                q: mInput.val(),
                type: 'track',
                territory: 'TW'
            },
            headers: {
                Authorization: 'Bearer duA3r9l4jEhPP8QSxfeaSA=='
            },
            success: (data, textStatus, jqXHR ) => {
                if (data.tracks) {
                    if (data.tracks.data.length > 0) {
                        // 先清空搜尋列表
                        $('#table-search tbody tr').remove();

                        let mData = data.tracks.data;
                        
                        mData.forEach((x) => {
                            $('#table-search tbody').append(
                                '<tr data-mid="' + x.id + '"><td>' + 
                                '歌手：' + x.album.artist.name + '<br/>' + 
                                '專輯：' + x.album.name + '<br/>' + 
                                '歌名：' + x.name + '</td></tr>'
                            );
                        });

                        // 加入音樂到配對列表
                        $('#table-search tbody tr').on('click', function() {
                            let tr = $(this);

                            // 檢查是否有重複的單曲
                            let check = false;
                            musicList.forEach((t) => {
                                if (t.includes(String(tr.data('mid')))) {
                                    check = true;
                                }
                            });
                            if (check) {
                                alert('此單曲已選過囉！');
                                return;
                            }             

                            if (musicList.length < 6) {
                                musicList.push([String(tr.data('mid')), 0]);
                                console.dir(musicList);
    
                                $('#table-music tbody').append('<tr>' + tr.html() + '</tr>');
                            }

                            // 選取六首後停止增加歌曲
                            if (musicList.length >= 6) {
                                setSettingControllersState();
                            }                            
                        });                        
                    } else {
                        alert('搜尋沒有結果');
                    }
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                alert('發生錯誤');
            }
        });    
    });

    // 開始遊戲
    $('#btn-start').on('click', function() {
        setFrameSrc();
        $(this).html('遊戲已開始！');
        $(this).prop('disabled', true);
        $('#music-setting').hide();
        $('.game-panel').show();

        setTimeout(() => {
            $(this).hide();
        }, 1500);
    });

    function setSettingControllersState() {
        $('#btn-start').prop('disabled', false);
        $('#btn-search').prop('disabled', true);
        $('#music-input').prop('disabled', true);
        $('#btn-add-list').prop('disabled', true);
        $('#slt-music-list').prop('disabled', true);        
    }

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
        if (remainderCounter > 0) {
            sltCounter = 0;
            sltMusicTemp = [];
            lastNumTemp = undefined;
    
            console.log('刷新暫存');
        } else {
            $('#btn-end').click();
        }
    }

    async function setBtnRecovery() {
        await sltMusicTemp.forEach((x) => {
            if (x.data('state') !== 1) {
                // x.removeClass('btn-primary');
                // x.addClass('btn-dark');
            } else {
                x.html('&nbsp;完成');
                x.prop('disabled', true);     
            }
        });
    }

    $('.btn-play').on('click', function () {
        let btn = $(this);
        let num = btn.data('num');
        let state = btn.data('state');
        let frame = $('.music-player[data-num="' + num + '"]');

        console.log('點擊第 ' + num + ' 首音樂');

        // 連點了同一首音樂則停止播放，不計數與暫存
        if (num === lastNumTemp) {
            stop();

            // 取消目前的 teimout
            clearTimeout(timeout);

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
            // 連結到 KKBOX Widget 頁面
            frame.attr('src', frame.data('src'));

            lastNumTemp = num;
            sltCounter++;

            btn.html('&nbsp;停止');
            // btn.removeClass('btn-dark');
            // btn.addClass('btn-primary');

            // 播放 15 秒後停止播放
            timeout = setTimeout(() => {
                stop();
            }, 15000);
        }

        // 播放兩首歌曲後
        if (sltCounter >= 2) {
            // 播放的歌曲配對成功
            if (frame.data('src') === lastMusicSrcTemp) {
                sltMusicTemp.forEach((x) => {
                    x.data('state', 1);
                });
                remainderCounter--;

                console.log('歌曲配對成功');
            } else {
                console.log('歌曲配對失敗');
            }
        }

        lastMusicSrcTemp = frame.data('src');

        function stop() {
            // 連結到空白頁關閉 KKBOX Widget 頁面
            frame.attr('src', 'about:blank');

            // 若尚未屬於完成狀態則復原可播放狀態
            if (btn.data('state') !== 1) {
                btn.html('&nbsp;播放');
            }

            // 點擊播放兩首後
            if (sltCounter >= 2) {
                // 於第二首播放結束時自動刷新
                setBtnRecovery();
                refreshTemp();
            }
        }        
    });
});