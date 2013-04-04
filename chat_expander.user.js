// ==UserScript==
// @name        btc-e chat expander
// @namespace   btce
// @include     https://btc-e.com/
// @version     1.001
// @grant       none
// @require    https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require    https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js
// @require    https://cdn.jsdelivr.net/jquery.cookie/1.3.1/jquery.cookie.js
// ==/UserScript==

var oObj = {
    oStyle: {},
    oChatStyle: {},
    
    bExpanded : false,
    bReduced : false,
    
    toggleExpand: function()
    {
        if(!oObj.bExpanded)
        {
            $('#btce_chat').css('position', 'absolute').css('width', '700px').css('height', '600px').css('top', '10px').css('left', '10px').css('opacity', '0.9');
            $('#nChat').css('height', '560px').css('width', '700px');
            $('#nChatInput').css('width', '675px');
            $('#nChatSmilesButton').css('margin-left', '685px');
            $('#nChatSmiles').css('margin-left', '550px');
            $('#nChatLockIcon').css('margin-left', '660px');

            $("#btce_chat").draggable({
                handle: '#draggable_handle',
                appendTo: 'body'
            });
            
            $('#draggable_handle').show();
            $('#toggle_reduce').hide();

            oObj.bExpanded = true;
            $.cookie('bExpanded', '1', { expires: 365, path: '/' });
            $.cookie('bReduced', '0', { expires: 365, path: '/' });
        }
        else
        {
            $.each(oObj.oStyle, function(sKey, mValue)
            {
                $('#btce_chat').css(sKey, mValue);
            });
            $('#btce_chat').css('height', 'auto');

            $.each(oObj.oChatStyle, function(sKey, mValue)
            {
                $('#nChat').css(sKey, mValue);
            });

            $('#nChatInput').css('width', '275px');
            $('#nChatSmilesButton').css('margin-left', '284px');
            $('#nChatSmiles').css('margin-left', '140px');
            $('#nChatLockIcon').css('margin-left', '260px');
            
            $('#draggable_handle').hide();
            $('#toggle_reduce').show();
            
            $("#btce_chat").draggable("destroy");

            oObj.bExpanded = false;
            $.cookie('bExpanded', '0', { expires: 365, path: '/' });
            $.cookie('bReduced', '0', { expires: 365, path: '/' });
        }
    },
    
    toggleReduce: function()
    {
        if(!oObj.bReduced)
        {
            $('#toggle_expand').hide();
            $('#toggle_reduce').attr('src', 'http://www.famfamfam.com/lab/icons/silk/icons/application_put.png');
            $('#nChatCon').hide();

            oObj.bReduced = true;
            $.cookie('bReduced', '1', { expires: 365, path: '/' });
            $.cookie('bExpanded', '0', { expires: 365, path: '/' });
        }
        else
        {
            $('#toggle_expand').show();
            $('#toggle_reduce').attr('src', 'http://www.famfamfam.com/lab/icons/silk/icons/application_get.png');
            $('#nChatCon').show();

            oObj.bReduced = false;
            $.cookie('bReduced', '0', { expires: 365, path: '/' });
            $.cookie('bExpanded', '0', { expires: 365, path: '/' });
        }
    },
    
    saveOriginalStyle: function()
    {
        oObj.oStyle.width = $('#btce_chat').css('width') || 'auto';
        oObj.oStyle.height = $('#btce_chat').css('height') || 'auto';
        oObj.oStyle.position = $('#btce_chat').css('position') || 'relative';
        oObj.oStyle.top = $('#btce_chat').css('top') || 'auto';
        oObj.oStyle.right = $('#btce_chat').css('left') || 'auto';
        oObj.oStyle.opacity = $('#btce_chat').css('opacity') || '1';

        oObj.oChatStyle.height = $('#nChat').css('height');
        oObj.oChatStyle.width = $('#nChat').css('width');
    }
};

if($('#nChatCon').length > 0)
{
    $('#nChatCon').parent().attr('id', 'btce_chat');

    var sHTML = '';
    sHTML +=    '<div id="draggable_handle" style="display:none;cursor:move;float:left;width:650px;">';
    sHTML +=        '<img src="http://www.famfamfam.com/lab/icons/silk/icons/arrow_out.png" />';
    sHTML +=    '</div>';
    sHTML +=    '<div style="float:right;">';
    sHTML +=        '<img id="toggle_reduce" style="cursor:pointer;" src="http://www.famfamfam.com/lab/icons/silk/icons/application_get.png" />';
    sHTML +=        '<img id="toggle_expand" style="cursor:pointer;margin-left:10px;" src="http://www.famfamfam.com/lab/icons/silk/icons/application_double.png" />';
    sHTML +=    '</div>';
    sHTML +=    '<div style="clear:both;"></div>';

    $('#btce_chat').prepend(sHTML);

    $('#toggle_expand').click(function()
    {
        oObj.toggleExpand();
    });
    
    $('#toggle_reduce').click(function(){
        oObj.toggleReduce();
    });

    oObj.saveOriginalStyle();
    
    // get and set may saved values
    var bReduced = $.cookie('bReduced');
    var bExpanded = $.cookie('bExpanded');

    switch(bReduced)
    {
        case '1':
        {
            oObj.toggleReduce();
            break;
        }
    }
    
    switch(bExpanded)
    {
        case '1':
        {
            oObj.toggleExpand();
            break;
        }
    }
}