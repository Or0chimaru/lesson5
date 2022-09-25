import { hello_backend } from "../../declarations/hello_backend";

async function post() {
  let post_button = document.getElementById("post")
  let error = document.getElementById("error")
  error.innerText = ""
  post_button.disabled = true
  let textarea = document.getElementById("message")
  let otp = document.getElementById("otp").value
  let text = textarea.value
  try {
    await hello_backend.post(otp, text)
    textarea.value = ""
    error.innerText = "Done!"
  } catch (err) {
    console.log(err)
    let err_info = "Post Failed! Wrong password."
    error.innerText = err_info
    alert("Post Failed! Wrong password.")
  }
  post_button.disabled = false
};

var num_posts = 0
var posts_list = []
async function load_posts() {
  let load_posts_button = document.getElementById("load_posts")
  let posts_section = document.getElementById("posts")
  load_posts_button.disabled = true
  let posts = await hello_backend.posts()
  posts_list = posts
  load_posts_button.disabled = false
  console.log(posts)
  let load_nothing = document.getElementById("load_nothing")
  load_nothing.innerText = ""
  if (num_posts == posts.length) {
    let info = 'No New Posts!'
    load_nothing.innerText = info
    alert(info)
    console.log(info)
    return
  } else {
    posts_section.replaceChildren([])
    num_posts = posts.length

    for (let i = 0; i < posts.length; i++) {
      let post = document.createElement("p")
      let timeStemp = parseInt(posts[i].time / 1000000n)
      let d = new Date(timeStemp)
      post.innerText = "Author: " + posts[i].author + "\n" + "Content: " + posts[i].text + "\n" + "Time: " + d
      posts_section.appendChild(post)
    }
  }
}

var num_follows = 0;
var id_list = [];
var find_followed_posts_button_list = []

var hasClass = function (el, className) {
  return (' ' + el.className + ' ').indexOf(' ' + className + ' ') > -1;
}

function find_followed_posts(event) {
  let author_name = this.id
  function check_id(timeline) {
    return timeline.author[0] == author_name
  }
  let followed_posts = timeline_list.filter(check_id)
  console.log("followed posts: ", followed_posts)
  console.log(this.id)

  let content_id = this.id + "posts"
  let content = document.getElementById(content_id)
  for (let i = 0; i < followed_posts.length; i++) {
    let post = document.createElement("p")
    let timeStemp = parseInt(followed_posts[i].time / 1000000n)
    let d = new Date(timeStemp)
    post.innerText = "Author: " + followed_posts[i].author + "\n" + "Content: " + followed_posts[i].text + "\n" + "Time: " + d
    content.appendChild(post)
  }


}

document.addEventListener('click', function (e) {
  if (hasClass(e.target, 'author')) {
      e.preventDefault();
      find_followed_posts.call(e.target, e);
  }
})


async function load_followed() {
  let load_followed_button = document.getElementById("load_followed")
  let followed_list = document.getElementById("followed_list")
  load_followed_button.disabled = true
  let follows = await hello_backend.follows()
  id_list = follows
  load_followed_button.disabled = false
  console.log("follows: " + follows)
  console.log(follows)
  let no_new_follows = document.getElementById("no_new_follows")
  no_new_follows.innerText = ""
  load_followed_button = false
  if (num_follows == follows.length) {
    let info = "No new followers, go follow some people."
    no_new_follows.innerText = info
    alert(info)
    return
  } else {
    followed_list.replaceChildren([])
    num_follows = follows.length

    for (let i = 0; i < follows.length; i++) {
      let id = follows[i];
      let author = await hello_backend.id_name(follows[i])
      let follower = document.createElement("button")
      let content = document.createElement("div")
      follower.id = author
      content.id = author + "posts"
      follower.className = "author"
      follower.innerText = `No.${i + 1} - ID: ${id} | Author: ${author}`
      followed_list.appendChild(follower)
      followed_list.appendChild(content)
      // let btn = document.getElementById(author)
      // find_followed_posts_button_list.push(btn)
    }
    console.log(find_followed_posts_button_list)
  }
}



var num_timeline = 0
var timeline_list = []
async function load_timeline() {
  let load_timeline_button = document.getElementById("load_timeline")
  let timeline = document.getElementById("timeline")
  load_timeline_button.disabled = true
  let timeline_res = await hello_backend.timeline()
  timeline_list = timeline_res
  load_timeline_button.disabled = false
  console.log(timeline_res)
  let no_new_timeline = document.getElementById("no_new_timeline")
  no_new_timeline.innerText = ""

  if (num_timeline == timeline_res.length) {
    let info = "No new timeline, please load later."
    no_new_timeline.innerText = info
    alert(info)
    return 
  } else {
    timeline.replaceChildren([])
    num_timeline = timeline_res.length

    for (let i = 0; i < timeline_res.length; i++) {
      let content = timeline_res[i]
      let each_post = document.createElement("p")
      each_post.className = content.author[0]
      let timeStemp = parseInt(content.time / 1000000n)
      let d = new Date(timeStemp)
      each_post.innerText = "Author: " + content.author + "\n" + "Content: " + content.text + "\n" + "Time: " + d
      timeline.appendChild(each_post)
    }
  }  
}

function load() {
  let post_button = document.getElementById("post")
  post_button.onclick = post;

  let load_posts_button = document.getElementById("load_posts")
  load_posts_button.onclick = load_posts

  let load_followed_button = document.getElementById("load_followed")
  load_followed_button.onclick = load_followed
  
  let load_timeline_button = document.getElementById("load_timeline")
  load_timeline_button.onclick = load_timeline

  load_followed()
  load_posts()
  load_timeline()
}

window.onload = load