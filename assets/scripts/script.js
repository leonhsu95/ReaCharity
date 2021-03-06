// BOOKMARK SAVES CURRENT SEARCH INTO ARRAY
const charities = JSON.parse(localStorage.getItem("Bookmarks")) || [];
const charName = JSON.parse(localStorage.getItem("charBookmarks")) || [];
var charityData;


function queryApiData() {
    var url = "https://data.gov.au/data/api/3/action/datastore_search?resource_id=eb1e6be4-5b13-4feb-b28e-388bf7c26f93";
    fetch(url)
    .then(data=>{return data.json()})
    .then((res)=>{
        // console.log(res);
        charityData = res.result.records;
    });
}

function filterApiData(stateFilter, causeFilter) {
    if (!charityData)
        return null;
    
    function arrayFilter(charity) {
        return (charity[stateFilter] === "Y" && charity[causeFilter] === "Y");
    }
    return charityData.filter(arrayFilter);
}


function generateAddress(charity) {

    var address = "";

    if (charity.Address_Line_1 !== "") {
        address = address + charity.Address_Line_1;
    }
    if (charity.Address_Line_2 !== "") {
        address = address+ ", " +charity.Address_Line_2;
    }
    if (charity.Address_Line_3 !== "") {
        address = address+ ", " +charity.Address_Line_3;
    }
    if (charity.Town_City !== "") {
        address = address+ ", " +charity.Town_City;
    }
    if (charity.State !== "") {
        address = address+ ", " +charity.State;
    }
    if (charity.Postcode !== "") {
        address = address+ ", " +charity.Postcode;
    }
    return address;
}


function resultBoxGenerator(filteredData) {

    var searchResults = document.getElementById("searchResults");
    console.log("Filtered Data: ",filteredData);

    while (searchResults.firstChild) {
        searchResults.removeChild(searchResults.firstChild);
    }

    if (filteredData.length === 0) {
        var noResultsDiv = document.createElement('div');
        noResultsDiv.setAttribute("class", "charity-container"); 
        var noResultsH3 = document.createElement('h3');
        var noResultsText = document.createTextNode("We couldn't find any results for that search... Try again");
        noResultsH3.appendChild(noResultsText);

        noResultsDiv.appendChild(noResultsH3);
        searchResults.appendChild(noResultsDiv);
        return;
    }

    filteredData.forEach(charity => {
        //Create container for charity data
        var containerDiv = document.createElement('div');
        containerDiv.id = "charity"+charity._id;
        containerDiv.setAttribute("class", "charity-container"); 

        //Charity name
        var nameHeader = document.createElement('h3');
        var nameText = document.createTextNode(charity.Charity_Legal_Name);
        nameHeader.id = "charityName"+charity._id;
        nameHeader.appendChild(nameText);

        containerDiv.appendChild(nameHeader);

        //Charity website
        var websiteAnchor = document.createElement('a');
        var website = "";
        if (!charity.Charity_Website.includes("http://") && !charity.Charity_Website.includes("https://")) {
            website = website +"https://";
        }
        website = website + charity.Charity_Website;
        websiteAnchor.setAttribute("target", "_blank");
        websiteAnchor.setAttribute("href", website);
        websiteAnchor.id = "charityWebsite"+charity._id;
        var webText = document.createTextNode(charity.Charity_Website);

        websiteAnchor.appendChild(webText);
        containerDiv.appendChild(websiteAnchor);
        
        //Charity address
        var addressAnchor = document.createElement('p');
        var appendedAddress = generateAddress(charity);
        addressAnchor.id = "charityAddress"+charity._id;
        var addressText = document.createTextNode(appendedAddress);

        addressAnchor.appendChild(addressText);

        //Creates link for map
        var mapData = getMapData(appendedAddress);
        containerDiv.appendChild(addressAnchor);

        if (mapData !== null){
            var mapButton = document.createElement("a");
            var buttonText = document.createTextNode("Open in Maps");
            mapButton.setAttribute("class", "open-maps");
            mapButton.appendChild(buttonText);
            mapButton.target = "_blank";
            mapButton.href = getMapData(appendedAddress);
            containerDiv.appendChild(mapButton);
        }
        
        // Bookmark Button

            var bookmarkButton = document.createElement("button");
            var bookmarkText = document.createTextNode("Save");
            bookmarkButton.id = "bookmarkButton"+charity._id;
            bookmarkButton.setAttribute("class", "bookmark-button");
            bookmarkButton.setAttribute("type","button");
            containerDiv.appendChild(bookmarkButton);
            bookmarkButton.appendChild(bookmarkText);          

            // BOOKMARKING TO ARRAY
            bookmarkButton.addEventListener("click", function(){
               
                var cName = charity.Charity_Legal_Name;
                var cWebsite = charity.Charity_Website;
                var cAddress = appendedAddress;

                charities.push({ name: cName, website: cWebsite, address: cAddress});
                charName.push(cName);

            // UNIQUE VALUES FOR ARRAY
                
                const map = {};
                const uniqueCharities = [];

                charities.forEach(el => {
                    if(!map[JSON.stringify(el)]){
                       map[JSON.stringify(el)] = true;
                       uniqueCharities.push(el);
                 }
              });

                const getUniqueCharName = (array) => ([...new Set(array)]);
                const uniqueCharName = getUniqueCharName(charName);

                localStorage.setItem("Bookmarks", JSON.stringify(uniqueCharities));
                localStorage.setItem("charBookmarks", JSON.stringify(uniqueCharName));

                const bookmarkFeedback = document.createElement("p");
                bookmarkFeedback.textContent= cName+" bookmarked!";
                bookmarkFeedback.setAttribute("class", "bookmarkFeedback");
                bookmarkButton.setAttribute("class","hide");
                containerDiv.appendChild(bookmarkFeedback);

                //   // Bookmark
                //   var bookmarkIcon = document.createElement("i");
                //   bookmarkIcon.id= "bookmarkIcon"+charity._id;
                //   bookmarkIcon.setAttribute("class","fas fa-bookmark bookmark-icon");
                        
                //   containerDiv.appendChild(bookmarkIcon);

            });

      
        // Attach charity to body
        searchResults.appendChild(containerDiv);

       

    });
}

queryApiData();

function getMapData(address){
    var addressURL = encodeURIComponent(address)
    var newUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + addressURL + '.json?access_token=pk.eyJ1IjoiZHJoZWFsIiwiYSI6ImNrbmZtdDhrMzFybTAydm9vYjh0ZHdmd2UifQ.xMSHVvkXrHSV-sO58EoFzg';
    var lat = '';
    var lon = '';

    if (!address){
        return null;
    }
    else if (address === undefined){
        return null;
    }
    else{
        $.ajax({
            async: false,
            url: newUrl,
            
            }).done(function(data) {
            results = data
            lat = data.features[0].geometry.coordinates[1]
            lon = data.features[0].geometry.coordinates[0]

            });
    var addressNew = 'https://www.google.com/maps/place/' + lat + ',' + lon
    return(addressNew)
    }
}

document.getElementById("searchBtn").addEventListener("click", function() {

    console.log(filterApiData(document.getElementById("stateDropdown").value, document.getElementById("causeDropdown").value));

    resultBoxGenerator(filterApiData(document.getElementById("stateDropdown").value, document.getElementById("causeDropdown").value));

});



var charityFacts = [{
    fact: "Charities in Australia have three primary sources of income. The first is the government, the second is donations and then then third is revenue from anything else; memberships, sales and investments to name a few. Around a quarter of all charities depend on donations and philanthropy for above half of their total revenue. Smaller charities tend to depend on donations more than larger charities."
},
{
    fact: "During the 2015-16 financial year, an 80.8% of all Australian adults had donated to charity, giving a total of around $12.5 billion to charities and Not-For-Profit organisations. The average donation was $764.08 and the median donation was $200."
},
{
    fact: "As of 2016-17, police had been the most generous occupation for 8 years in a row, with a little over 73% of individuals donating. This is followed by Machine Operators and School Principals, giving the 2nd and 3rd most respectively. Highest average deductions were made by CEOs and Managing Directors."
},
]
var factBox = document.querySelector(".card-text")


function onLoadFact(){
    factBox.innerHTML = charityFacts[0].fact
}

onLoadFact()

var interval = setInterval(textChange, 10000)

function textChange(){
    if (factBox.innerHTML === charityFacts[0].fact){
        factBox.innerHTML = charityFacts[1].fact
    }
    else if (factBox.innerHTML === charityFacts[1].fact){
        factBox.innerHTML = charityFacts[2].fact
    }
    else if (factBox.innerHTML === charityFacts[2].fact){
        factBox.innerHTML = charityFacts[0].fact
    }

}

var searchButton = document.querySelector(".searchButton")

searchButton.addEventListener("click", function(){
    setTimeout(function(){
        window.scrollTo({
            top: 1000,
            behavior: "smooth"
        });
    },200)

})

var resultsSearchBtn = document.querySelector("#searchBtn")
var theResults = document.querySelector("#charityResults")

resultsSearchBtn.addEventListener("click", function(){
    theResults.style.display = "block"
    setTimeout(function(){
        window.scrollTo({
            top: 1400,
            behavior: "smooth"
        });
    },500)

})

mybutton = document.getElementById("backToTop");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {

    if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
        $("#backToTop").slideDown('fast');
    } else {
        $("#backToTop").slideUp('fast');
    }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
} 