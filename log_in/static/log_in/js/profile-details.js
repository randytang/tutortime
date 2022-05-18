const edit_school_mjr_btn = document.querySelector("#edit-school-majors");

edit_school_mjr_btn.addEventListener("click", editSchoolMajor);

function editSchoolMajor(e) {
	/* i think the design decision to use javascript to navigate
	 * to different url is a bit more inefficient than say
	 * using a button element with form attributes because
	 * we'll have to hardcode the url we want to navigate to
	 * as opposed to using 'url' utility.
	 */
	location.href = "/app/profile/edit/school_courses/";
}
