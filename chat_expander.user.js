// ==UserScript==
// @name        btc-e chat expander
// @namespace   btce
// @include     https://btc-e.com/*
// @version     1.101
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceText
// @grant       GM_addStyle
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js
// @require     https://cdn.jsdelivr.net/flexicolorpicker/0.1/colorpicker.js
// @resource    jqueryuicss     http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/themes/smoothness/jquery-ui.min.css
// @resource    colorpickercss  https://cdn.jsdelivr.net/flexicolorpicker/0.1/themes.css
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
        if(oChat.exists())
        {
            oChat.init();
            
            // try to get and set css
            oInit.addCSS();
        }
    },
    
    addCSS: function()
    {
        // add css
        GM_addStyle(GM_getResourceText('jqueryuicss'));
        GM_addStyle(GM_getResourceText('colorpickercss'));
        
        // modify css rules with external images - we will load from google cdn instead relative to btc-e
        var sCustomCSS = '';
    
        sCustomCSS +=   '.ui-icon, .ui-widget-content .ui-icon';
        sCustomCSS +=   '{';
        sCustomCSS +=       'background-image: url("http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/themes/smoothness/images/ui-icons_222222_256x240.png")';
        sCustomCSS +=   '}';

        GM_addStyle(sCustomCSS);
    }
};


/* ==================================================================================================== */
/* OBJ SETTINGS ======================================================================================= */
/* ==================================================================================================== */
var oSettings = {
    get: function(sSetting, mDefault)
    {
        mDefault || '' ;
        return GM_getValue('BTCE_CE_mSetting_' + sSetting, mDefault);
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
        if(parseInt(iLength) > 0)
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
        $('#' + oChat.id + 'Con').css('height', 'auto');
        $('#' + oChat.id).css('height', '340px');
    },

    bindMethods: function()
    {
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
            
            // set new event
            $('a', oObjP).click(function(oEvent)
            {
                if(oSettings.get('bEnlarged', 0) == 1)
                {
                    var oOffset = $('#ce_bar').parent().offset();
    
                    $('#cMenu').css('left', oEvent.pageX - oOffset.left + 'px');
                    $('#cMenu').css('top', oEvent.pageY - oOffset.top + 'px');                    
                }
                else
                {
                    $('#cMenu').css('left', oEvent.pageX + 'px');
                    $('#cMenu').css('top', oEvent.pageY + 'px');
                }
            });

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
            $('#ce_options_blocked_user').append('<div style="cursor:pointer;" title="remove ' + sUserID + ' from blocklist" class="ce_unblock_user" user_id="' + sUserID + '" >' + sUserID + '</div>');
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
    enableResizable: function()
    {
        $('#ce_bar').parent().resizable(
        {
            resize: function(oEvent, oUi)
            {
                $('#' + oChat.id).css('height', (oUi.size.height - 39) + 'px');
            },
            stop: function(oEvent, oUi)
            {
                oSettings.set('ce_resizable_height', oUi.size.height);
                oSettings.set('ce_resizable_width', oUi.size.width + 'px');
            }
        });
    },
    
    destroyResizable: function()
    {
        try
        {
            $('#ce_bar').parent().resizable('destroy');
        }
        catch(oError){}
    },
    
    enableDraggable: function()
    {
        // make it draggable and resizable
        $('#ce_bar').parent().draggable(
        {
            handle:         '#ce_bar',
            appendTo:       'content',
            opacity:        0.9,
            stop:           function(oEvent, oUi)
            {
                oSettings.set('ce_draggable_left', $('#ce_bar').parent().css('left'));
                oSettings.set('ce_draggable_top', $('#ce_bar').parent().css('top'));
            }
        });
    },
    
    destroyDraggable: function()
    {
        try
        {
            $('#ce_bar').parent().draggable('destroy');
        }
        catch(oError){}
    },

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
    
                // if enabled allready destroy draggable
                oTrigger.destroyDraggable();
                
                // if enabled allready destroy resizable
                oTrigger.destroyResizable();
    
                $('#ce_bar').parent().css('top', 'auto').css('left', 'auto').css('width', 'auto').css('position', 'static').css('height', 'auto');
                
                // restore height of chat box
                $('#' + oChat.id).css('height', '340px');
            }
            else
            {
                oSettings.set('bEnlarged', 1);
    
                $('#ce_bar').css('cursor', 'move');
                
                // make it draggable
                oTrigger.enableDraggable()
                
                if(oSettings.get('bImgMinimized', 0) == 0)
                {
                    // make it resizable
                    oTrigger.enableResizable()
                }

                $('#ce_bar').parent().css('position', 'absolute').css('width', oSettings.get('ce_resizable_width', '140px'));
                $('#' + oChat.id).css('height', (oSettings.get('ce_resizable_height', 378) - 39) + 'px');

                $('#ce_bar').parent().css('left', oSettings.get('ce_draggable_left', '140px')).css('top', oSettings.get('ce_draggable_top', '85px'));
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
                
                if(oSettings.get('bEnlarged', 0) == 1)
                {
                    // make it resizable
                    oTrigger.enableResizable()
                }
            }
            else
            {
                $('#ce_img_minimize').attr('src', oImages.minimize_to_max);
                oSettings.set('bImgMinimized', '1');
                
                $('#ce_bar').parent().css('height', 'auto');
                
                // if enabled allready destroy resizable
                oTrigger.destroyResizable();
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
        sHTML +=            'Query Archive';
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