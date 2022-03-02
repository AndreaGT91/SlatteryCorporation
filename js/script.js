"use strict";

const mediaPath = "./media/";
const portfolioMediaPath = mediaPath + "portfolio/";
const aboutMediaPath = mediaPath + "about/";

const projectPrefix = "project-";
const imagePrefix = "image-";

const JJSjrEmail = "JosephJohnSlatteryJr@SlatteryCompanyLLC.com";

// replace "\n" if found in JSON
const replaceNewlines = value => value.replace(/\n/gi, "</p><p>");

// Portfolio list needs to be global for access in onClick
let portfolioList = [];

// On page load
$(() => {
  // Set onclick handler to open/close side menu when hamburger clicked on mobile
  $(".navbar-toggler").click(() => {
    $(".offcanvas-collapse")[0].classList.toggle("open");
  });

  // Initialize Animate on Scroll library 
  AOS.init({ duration: 1500 });

  // Make appropriate navbar link active
  $(".nav-item").attr("aria-current", false);
  $(".nav-link").find(".active").removeClass("active");

  if (window.location.pathname.includes("portfolio")) {
    $("#portfolio-link").addClass("active");
    $("#portfolio-link").parent().attr("aria-current", "page");
    setupPortfolio();
  }
  else if (window.location.pathname.includes("about")) {
    $("#about-link").addClass("active");
    $("#about-link").parent().attr("aria-current", "page");
    setupAbout();
  }
  else if (window.location.pathname.includes("contact")) {
    $("#contact-link").addClass("active");
    $("#contact-link").parent().attr("aria-current", "page");
    $("#copy-button").click(() => navigator.clipboard.writeText(JJSjrEmail));
  }
  else {
    $("#home-link").addClass("active");
    $("#home-link").parent().attr("aria-current", "page");
  };
}); // end of page load function

function onProjectClick(event) {
  event.preventDefault();

  const portfolioImagesPath = portfolioMediaPath + "images/";

  const carouselIndicators = $("#carouselIndicators");
  const carouselInner = $("#carouselInner");
  const projectDetail = $("#projectDetail");

  // Empty data from previous project
  carouselIndicators.empty();
  carouselInner.empty();
  projectDetail.empty();

  // Extract which project was clicked from event
  let clickedProject = portfolioList[parseInt(event.target.parentElement.id.slice(projectPrefix.length))]

  // If there images, create the carousel
  if (clickedProject.images.length > 0) {
    let newIndicator;
    let newInner;

    for (let i=0; i<clickedProject.images.length; i++) {
      newIndicator = $(`<button type="button" 
          data-bs-target="#projectCarousel" 
          data-bs-slide-to="${i}" 
          aria-label="${clickedProject.caption}">
        </button>`);
      newInner = $(`<div class="carousel-item"> 
          <img class="mx-auto d-block" id="${imagePrefix}${i}" 
            src="${portfolioImagesPath + clickedProject.images[i]}" 
            alt="Image ${i} of ${clickedProject.caption}"> 
        </div>`);

      // Add active classes to first elements
      if (i == 0) {
        newIndicator.addClass("active");
        newIndicator.attr("aria-current", "true");
        newInner.addClass("active");
      };

      newIndicator.appendTo(carouselIndicators);
      newInner.appendTo(carouselInner);
    };

    // Make carousel visible
    $("#projectCarousel").removeClass("d-none");
    $("#projectCarousel").addClass("d-flex");
  };

  // Add div with details of project
  let projectDesc = $(`<div class="text-center h5">
    <p>${replaceNewlines(clickedProject.title)}</p></div>
    <div class="text-start">
    <p>${replaceNewlines(clickedProject.description)}</p></div>`);
  projectDesc.appendTo(projectDetail);

  // Make the project description div visible
  $("#projectDesc").removeClass("d-none");
  $("#projectDesc").addClass("d-flex");
}; // end function onProjectClick

function setupPortfolio() {
  const portfolioDataPath = portfolioMediaPath + "portfolio.json";
  const portfolioThumbsPath = portfolioMediaPath + "thumbnails/";

  const projectList = $("#projectList");

  // On page load, empty global portfolioi list and displayed project list; 
  // hide carousel and project description
  portfolioList = [];
  projectList.empty();
  $("#projectCarousel, #projectDesc").removeClass("d-flex");
  $("#projectCarousel, #projectDesc").addClass("d-none");

  // Read portfolio information from external file and add to Portfolio page
  $.getJSON(portfolioDataPath)
    .done(function (projects) {
      // Only build page if there are projects
      if (projects.length > 0) {
        let newProject;

        $.each(projects, function (index, project) {
          newProject = $(`<div class="col mx-auto">
            <figure class="figure mt-2" id="${projectPrefix}${index}">
              <img src="${portfolioThumbsPath + project.thumbnail}"
                class="figure-img img-fluid rounded" 
                alt="Thumbnail for ${project.caption} project">
              <figcaption class="figure-caption text-center text-light">
                ${project.caption}
              </figcaption>
            </figure>
          </div>`);

          // Add active class to first project
          if (index == 0) {
            newProject.addClass("active");
            newProject.attr("aria-current", "true");
          };

          newProject.appendTo(projectList);
          portfolioList.push(project);
        });

        // Add click event handler to all the projects
        $("figure").click(onProjectClick);
      };
    })
    .fail(function (jqxhr, textStatus, error) {
      // Display error to console for debugging
      console.log("Loading portfolio.json failed: ", textStatus, error);

      // Let user know that data could not be loaded
      projectList.append(`<div class="col mx-auto">
        Error: Could not load Portfolio.</div>`);
    });
}; // end function setupPortfolio

function setupAbout() {
  const aboutBioData = aboutMediaPath + "about.json";

  const columnSlide = `<div class="col-md-6 col-sm-12 mx-auto">
    <div data-aos="slide-right" data-aos-delay="`;
  const cardBodyTitle = `" class="card text-dark bg-light m-3">
    <div class="card-body"> <h5 class="card-title">`;
  const cardText = `</h5> <div class="card-text">`;
  const imgSrc = `<img src="`;
  const imgAltText = `" alt="`;
  const imgStyle = `" style="float: left; margin: 10px 20px 10px 0; max-width: 30%;">`;
  const paraText = `<p>`;
  const endCard = `</p> </div> </div> </div> </div>`;

  let cardContent = ""; // Will be used to build card text based on object
  const initialSlideDelay = 300; // First slide delay 300ms
  let slideDelay = initialSlideDelay; // Each card delays for 300ms longer

  // Read bio information from external file and add to About page
  $.getJSON(aboutBioData)
    .done(function (bioInfo) {
      $.each(bioInfo, function (index, bioItem) {
        // If image included, add it before paragraph text
        if (bioItem.hasOwnProperty("image")) {
          cardContent = imgSrc + aboutMediaPath + bioItem.image;
          if (bioItem.hasOwnProperty("altText")) {
            cardContent += imgAltText + replaceNewlines(bioItem.altText);
          };
          cardContent += imgStyle + paraText;
        }
        else cardContent = paraText;

        // Construct card to add; replace \n with </p><p> to display correctly
        $("#about-row").append(columnSlide + slideDelay + cardBodyTitle +
          replaceNewlines(bioItem.title) + cardText + cardContent +
          replaceNewlines(bioItem.body) + endCard);

        slideDelay += initialSlideDelay;
      });
    })
    .fail(function (jqxhr, textStatus, error) {
      // Display error to console for debugging
      console.log("Loading about.json failed: ", textStatus, error);

      // Let user know that data could not be loaded
      $("#about-row").append(columnSlide + slideDelay + cardBodyTitle +
        "Error" + cardText + paraText + "Could not load Mr. Slattery's bio." + endCard);
    });
}; // end funciton setupAbout