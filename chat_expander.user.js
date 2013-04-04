// ==UserScript==
// @name        btc-e chat expander
// @namespace   btce
// @include     https://btc-e.com/
// @version     1
// @grant       none
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require    http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js
// ==/UserScript==

var oObj = {
    oStyle: {},
    oChatStyle: {},
    
    bExpanded : false,
    
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

            oObj.bExpanded = true;
        }
        else
        {
            $.each(oObj.oStyle, function(sKey, mValue)
            {
                $('#btce_chat').css(sKey, mValue);
            });

            $.each(oObj.oChatStyle, function(sKey, mValue)
            {
                $('#nChat').css(sKey, mValue);
            });

            $('#nChatInput').css('width', '275px');
            $('#nChatSmilesButton').css('margin-left', '284px');
            $('#nChatSmiles').css('margin-left', '140px');
            $('#nChatLockIcon').css('margin-left', '260px');
            
            $('#draggable_handle').hide();
            
            $("#btce_chat").draggable("destroy");

            oObj.bExpanded = false;
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
    $('#btce_chat').prepend('<div id="draggable_handle" style="display:none;cursor:move;float:left;width:670px;"><img src="http://www.famfamfam.com/lab/icons/silk/icons/arrow_out.png" /></div><div style="float:right;"><img id="toggle_expand" style="cursor:pointer;" src="http://www.famfamfam.com/lab/icons/silk/icons/application_double.png" /></div><div style="clear:both;"></div>');
    $('#toggle_expand').click(function()
    {
        oObj.toggleExpand();
    });

    oObj.saveOriginalStyle();
}