// ==UserScript==
// @name        btc-e chat expander
// @namespace   btce
// @include     https://btc-e.com/*
// @version     1.092
// @grant       GM_getValue
// @grant       GM_setValue
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js
// @require     https://cdn.jsdelivr.net/flexicolorpicker/0.1/colorpicker.js
// @resource    colorpickercss https://cdn.jsdelivr.net/flexicolorpicker/0.1/themes.css
// ==/UserScript==


/* ==================================================================================================== */
/* INIT - ENTRY POINT ================================================================================= */
/* ==================================================================================================== */
$(document).ready(function()
{
    oInit.init(); 
});


/* ==================================================================================================== */
/* OBJ INIT =========================================================================================== */
/* ==================================================================================================== */
var oInit = {
    init: function()
    {
        // only init chat expander if chat id exists in document
        if(oChat.exists)
        {
            oChat.init();
        }
    }
};


/* ==================================================================================================== */
/* OBJ SETTINGS ======================================================================================= */
/* ==================================================================================================== */
var oSettings = {
    get: function(sSetting)
    {
        return GM_getValue('BTCE_CE_mSetting_' + sSetting, '');
    },
    set: function(sSetting, sValue)
    {
        GM_setValue('BTCE_CE_mSetting_' + sSetting, sValue);
    }
};


/* ==================================================================================================== */
/* OBJ CHAT EXPANDER ================================================================================== */
/* ==================================================================================================== */
var oChat = {
    // chat id
    id: 'nChat',

    // checks if chat element exists
    exists: function()
    {
        var iLength = $('#' + oChat.id).length;
        var bExists = false;
        if(iLength > 0)
        {
            bExists = true;
        }
        return bExists;
    },

    // init of the chat expander
    init: function()
    {    
        // get blacklist data
        oBlocklist.getList();
        
        // get usercolor data
        oUserColor.getList();

        // insert html data
        oChat.insertOwnHTML();
        
        // parse given chat
        oChat.parseChat();

        // add events
        oChat.bindMethods();
    },

    // inserts our new html
    insertOwnHTML: function()
    {
        // inser html bar on top of chat
        $(oTemplates.getHTML_Bar()).insertBefore('#' + oChat.id + 'Con');
        $(oTemplates.getHTML_OptionsMenu()).insertAfter('#' + oChat.id + 'Con');
        
        // insert new user options
        $('#cMenu').append(oTemplates.getHTML_UserOptions());
        $('#cMenu').append(oTemplates.getHTML_SearchInArchive());
        $('#cMenu').append(oTemplates.getHTML_ColorPicker());
        
        // modify width of original chat
        $('#' + oChat.id + 'Con, #' + oChat.id).css('width', 'auto');
    },

    bindMethods: function()
    {
        // onclick img minimize
        $('#ce_img_minimize').click(function()
        {
            if($('#' + oChat.id + 'Con').css('display') == 'none')
            {
                $('#' + oChat.id + 'Con').show();
                $('#ce_options').hide();
            }
            else
            {
                $('#' + oChat.id + 'Con').hide();
            }
            oTrigger.img_minimize();
        });
        oTrigger.img_minimize(true);
        
        // onclick img settings
        $('#ce_img_settings').click(function()
        {
            // not shown - show options
            if($('#ce_options').css('display') == 'none')
            {
                // refresh blocked users list
                oBlocklist.refreshBlockList();

                // hide normal chat window
                $('#nChatCon').hide();

                // show options window
                $('#ce_options').show();
            }
            else
            {
                if(parseInt(oSettings.get('bImgMinimized')) <= 0)
                {
                    $('#nChatCon').show();
                }
                $('#ce_options').hide();
            }
        });
        
        // onclick img enlarge
        $('#ce_img_enlarge').click(function()
        {
            oTrigger.img_enlarge();
        });
        oTrigger.img_enlarge(true);

        // onclick block new user        
        $('#divOptionBlockNewUser').click(function()
        {
            oChat.blockNewUser();
        });
        
        // onclick search in archive
        $('#divOptionSearchInArchive').click(function()
        {
            oChat.seachInArchive();
        });
        
        // init colorpicker
        ColorPicker($('#ce_colorpicker_slide')[0], $('#ce_colorpicker_picker')[0], function(sHex, sHsv, sRgb)
        {
            oChat.setUserColor(sHex, sHsv, sRgb);
        });
        
        // on new chats
        $('#' + oChat.id).bind('DOMNodeInserted', function(oEvent)
        {
            oChat.parseChat();
        });
    },

    parseChat: function()
    {
        // get all not parsed entrys in chat
        $('#' + oChat.id + ' > p:not(.parsed)').each(function(iKey, oObjP)
        {
            // set as parsed
            $(oObjP).addClass('parsed');

            // get username
            var sUserID = $('a', oObjP).text();

            // add username into css - so we can fetch this user later simple
            $(oObjP).addClass('user_' + sUserID);

            // check if user is blocked
            if(oBlocklist.isBlocked(sUserID))
            {
                // block user (why we need an delay here?)
                setTimeout(function()
                {
                    $('.user_' + sUserID, '#' + oChat.id).css('display', 'none');
                }, 50);
            }
            
            // get and set color of user
            $('span', oObjP).css('color', oUserColor.get(sUserID));
        });
    },

    blockNewUser: function()
    {
        var sUserID = $('#cMenuH').text() || '' ;

        if($.trim(sUserID) != '')
        {
            $('.user_' + sUserID, '#' + oChat.id).css('display', 'none');
            oBlocklist.add(sUserID);
        }
    },
    
    seachInArchive: function()
    {
        var sUserID = $('#cMenuH').text() || '' ;
        
        if($.trim(sUserID) != '')
        {
            window.open('http://trollboxarchive.com/search.php?search_type=username&search=' + sUserID);
        }
    },

    setUserColor: function(sHex, sHsv, sRgb)
    {
        var sUserID = $('#cMenuH').text() || '' ;

        if($.trim(sUserID) != '')
        {
            $('span', '#' + oChat.id + ' .user_' + sUserID).css('color', sHex);
            oUserColor.change(sUserID, sHex);
        }
    }
};


/* ==================================================================================================== */
/* OBJ USERCOLOR ====================================================================================== */
/* ==================================================================================================== */
var oUserColor = {
    oList: {},
    change: function(sUserID, sHex)
    {
        oUserColor.oList[sUserID] = sHex;
        oUserColor.saveList();
    },
    
    get: function(sUserID)
    {
        var sHex = '#000000';
        if(oUserColor.oList[sUserID])
        {
            sHex = oUserColor.oList[sUserID];
        }
        return sHex;
    },
    
    getList: function()
    {
        oUserColor.oList = JSON.parse(GM_getValue('BTCE_CE_oUserColor', '{}'));
    },
    
    saveList: function()
    {
        GM_setValue('BTCE_CE_oUserColor', JSON.stringify(oUserColor.oList));
    },
    
    flush: function()
    {
        GM_setValue('BTCE_CE_oUserColor', '{}');
        oUserColor.getList();
    }
};


/* ==================================================================================================== */
/* OBJ BLOCKLIST ====================================================================================== */
/* ==================================================================================================== */
var oBlocklist = {
    oList: {},
    add: function(sUserID)
    {
        oBlocklist.oList[sUserID] = true;
        oBlocklist.saveList();
    },

    isBlocked: function(sUserID)
    {
        var bIsBlocked = false;

        if(oBlocklist.oList[sUserID] && oBlocklist.oList[sUserID] == true)
        {
            bIsBlocked = true;
        }

        return bIsBlocked;
    },
    
    getList: function()
    {
        oBlocklist.oList = JSON.parse(GM_getValue('BTCE_CE_oBlacklist', '{}'));
    },
    
    saveList: function()
    {
        GM_setValue('BTCE_CE_oBlacklist', JSON.stringify(oBlocklist.oList));
    },
    
    flush: function()
    {
        GM_setValue('BTCE_CE_oBlacklist', '{}');
        oBlocklist.getList();
    },
    
    remove: function(sUserID)
    {
        if(oBlocklist.oList[sUserID])
        {
            delete oBlocklist.oList[sUserID];
            oBlocklist.saveList();
            
            $('.user_' + sUserID, '#' + oChat.id).css('display', 'block');
        }
    },
    
    refreshBlockList: function()
    {
        $('#ce_options_blocked_user').empty();
        $.each(oBlocklist.oList, function(sUserID, bTrue)
        {
            $('#ce_options_blocked_user').append('<div style="cursor:pointer;" class="ce_unblock_user" user_id="' + sUserID + '" >' + sUserID + '</div>');
        });

        $('.ce_unblock_user', '#ce_options').mouseover(function()
        {
            $(this).css('text-decoration', 'line-through');
        }).mouseout(function()
        {
            $(this).css('text-decoration', 'none');
        }).click(function()
        {
            oBlocklist.remove($(this).attr('user_id'))
            $(this).remove();
        });
    }
};

/* ==================================================================================================== */
/* OBJ TRIGGER ======================================================================================== */
/* ==================================================================================================== */
var oTrigger = {
    img_enlarge: function(bGetSavedState)
    {
        bGetSavedState = bGetSavedState || false;
        
        if(bGetSavedState)
        {
            if(parseInt(oSettings.get('bEnlarged')) > 0)
            {
                oSettings.set('bEnlarged', 0);
                $('#ce_img_enlarge').click();
            }
        }
        else
        {
            if(parseInt(oSettings.get('bEnlarged')) > 0)
            {
                oSettings.set('bEnlarged', 0);
                    
                $('#ce_bar').css('cursor', 'auto');
    
                try
                {
                    $('#ce_bar').parent().draggable('destroy');
                }
                catch(oError){}
    
                $('#ce_bar').parent().css('top', 'auto').css('left', 'auto').css('width', 'auto').css('position', 'static');
            }
            else
            {
                oSettings.set('bEnlarged', 1);
    
                $('#ce_bar').css('cursor', 'move');
                    
                $('#ce_bar').parent().css('position', 'absolute').css('width', '700px');
    
                $('#ce_bar').parent().draggable(
                {
                    handle:         '#ce_bar',
                    appendTo:       'content',
                    opacity:        0.9,
                    stop:           function(oEvent, oUI)
                    {
                        oSettings.set('ce_draggable_left', $('#ce_bar').parent().css('left'));
                        oSettings.set('ce_draggable_top', $('#ce_bar').parent().css('top'));
                    }
                });

                $('#ce_bar').parent().css('left', (oSettings.get('ce_draggable_left') || '140px')).css('top', (oSettings.get('ce_draggable_top') || '85px'));
            }
        }
    },

    img_minimize: function(bGetSavedState)
    {
        bGetSavedState = bGetSavedState || false;
        
        if(bGetSavedState)
        {
            var iState = oSettings.get('bImgMinimized');

            if(parseInt(iState) > 0)
            {
                $('#ce_img_minimize').click();
            }
        }
        else
        {
            // check minimize status
            if($('#' + oChat.id + 'Con').css('display') == 'block')
            {
                $('#ce_img_minimize').attr('src', oImages.minimize_to_min);
                oSettings.set('bImgMinimized', '0');
            }
            else
            {
                $('#ce_img_minimize').attr('src', oImages.minimize_to_max);
                oSettings.set('bImgMinimized', '1');
            }        
        }
    },

    block_new_user: function()
    {
        oChat.blockNewUser()
    }
};


/* ==================================================================================================== */
/* OBJ IMAGES ========================================================================================= */
/* ==================================================================================================== */
var oImages = {
    close: 'http://www.famfamfam.com/lab/icons/silk/icons/application_delete.png',
    expand_max: 'http://www.famfamfam.com/lab/icons/silk/icons/application_double.png',
    expand_min: 'http://www.famfamfam.com/lab/icons/silk/icons/application_double.png',
    minimize_to_min: 'http://www.famfamfam.com/lab/icons/silk/icons/application_put.png',
    minimize_to_max: 'http://www.famfamfam.com/lab/icons/silk/icons/application_get.png',    
    settings: 'http://www.famfamfam.com/lab/icons/silk/icons/application_edit.png'
};


/* ==================================================================================================== */
/* OBJ TEMPLATES ====================================================================================== */
/* ==================================================================================================== */
var oTemplates = {
    getHTML_Bar: function()
    {
        var sHTML = '';
        sHTML +=    '<div id="ce_bar">';
        sHTML +=        '<div style="float:left;height:16px;">';
        sHTML +=            '<img id="ce_img_settings" style="margin-right:5px;cursor:pointer;" src="' + oImages.settings + '" alt="S" title="settings" />';
        sHTML +=        '</div>';
        sHTML +=        '<div style="float:right;height:16px;">';
        sHTML +=            '<img id="ce_img_minimize" style="margin-left:5px;cursor:pointer;" src="' + oImages.minimize_to_min + '" alt="M" title="minimize" />';
        sHTML +=            '<img id="ce_img_enlarge" style="margin-left:5px;cursor:pointer;" src="' + oImages.expand_max + '" alt="E" title="enlarge" />';
        sHTML +=        '</div>';
        sHTML +=        '<div style="clear:both;"></div>';
        sHTML +=    '</div>';

        return sHTML;
    },

    getHTML_UserOptions: function()
    {
        var sHTML = '';
        sHTML +=    '<span>';
        sHTML +=        '<a id="divOptionBlockNewUser" class="profileBtn" style="cursor:pointer">';
        sHTML +=            'Block User';
        sHTML +=        '</a>';
        sHTML +=    '</span>';

        return sHTML;
    },

    getHTML_SearchInArchive: function()
    {
        var sHTML = '';
        sHTML +=    '<span>';
        sHTML +=        '<a id="divOptionSearchInArchive" class="profileBtn" style="cursor:pointer">';
        sHTML +=            'Search in Archive';
        sHTML +=        '</a>';
        sHTML +=    '</span>';

        return sHTML;
    },

    getHTML_ColorPicker: function()
    {
        var sHTML = '';
        sHTML +=    '<span>';
        sHTML +=        '<a id="divOptionBlockNewUser" onclick="return false;" class="profileBtn" style="cursor:pointer">';
        sHTML +=            '<div id="ce_colorpicker" style="cursor:crosshair;">';
        sHTML +=                '<div onclick="return false;" id="ce_colorpicker_picker" style="width:100px; height:100px; float:left;"></div>';
        sHTML +=                '<div onclick="return false;" id="ce_colorpicker_slide" style="width:10px; height:100px; float:left;"></div>';
        sHTML +=                '<div style="clear:both;"></div>';
        sHTML +=            '</div>';
        sHTML +=        '</a>';
        sHTML +=    '</span>';
        
        return sHTML;
    },
    
    getHTML_OptionsMenu: function()
    {
        var sHTML = '';
        sHTML +=    '<div id="ce_options" style="display:none; width:' + ($('#nChatCon').css('width') || '200px') + '; height:' + ($('#nChatCon').css('height') || '359px') + '">';
        sHTML +=        '<div style="color:#8DA0B9;">Blocked Users:</div>';
        sHTML +=        '<div id="ce_options_blocked_user"></div>';
        sHTML +=    '</div>';
        
        
        return sHTML;
    }
};