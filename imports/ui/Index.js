import './static/About.html';
import './static/Home.html';
import './Index.html';

import './record-game/RecordHongKongGame';
import './record-game/RecordJapaneseGame';
import './statistics/EloGraph';
import './statistics/ComparisonStatistics';
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
        let currentTab = $( event.target ).closest( "li" );

        if (currentTab.data("template") === undefined)
            return;

        currentTab.addClass( "active" );
        $( ".nav-tabs li" ).not( currentTab ).removeClass( "active" );

        template.currentTab.set( currentTab.data( "template" ) );
    }
});
