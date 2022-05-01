import './static/About.html';
import './Index.html';

import './home/Home';
import './record-game/RecordHongKongGame';
import './record-game/RecordJapaneseGame';
import './ranking/Ranking';

Template.Index.onCreated( function() {
    this.currentTab = new ReactiveVar( "Home" );
});

Template.Index.helpers({
    tab() {
        return Template.instance().currentTab.get();
    },
});

Template.Index.events({
    'click .nav-tabs li'( event, template ) {
        // Prevent dropdown menus from being selectable,
        // but maintain their clickiness
        var currentTab = $( event.target ).closest( "li" );

        if (currentTab.data("template") === undefined)
            return;

        currentTab.addClass( "active" );
        $( ".nav-tabs li" ).not( currentTab ).removeClass( "active" );

        template.currentTab.set( currentTab.data( "template" ) );
    }
});
