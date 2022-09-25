import Iter "mo:base/Iter";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";

actor {
  public type Message = {
    author: ?Text;
    text: Text;
    time: Time.Time;
  };
  public type Passwd = Text;

  // 测试 Microblog type 不一致是否对 timeline 函数有影响
  public type Microblog = actor {
    follow: shared(Principal) -> async (); // add following
    follows: shared query () -> async [Text]; // return following people list
    post: shared (Text, Text) -> async (); // post microblog
    posts: shared query () -> async [Message]; // return all of posted microblog after time_point
    timeline: shared () -> async [Message]; // return all of following people posted microblog
    set_name: shared (Text) -> async (); // set author name
    get_name: shared query () -> async ?Text;
    unfollow_all: shared (Text) -> async ();
    clean_posts: shared (Text) -> async ();
  };

  stable var followed : List.List<Principal> = List.nil();
  stable let empty_followed : List.List<Principal> = List.nil();

  // 输入密码和要关注对象的 canister ID，进行关注操作，可避免重复关注
  public shared func follow(otp: Passwd, id: Principal) : async () {
    assert(otp == passwd);
    let isFollowed = func(x: Principal) : Bool { x == id };
    let res = List.find(followed, isFollowed);
    if (res == null) followed := List.push(id, followed);
  };
  
  public shared query func follows() : async [Text] {
    let principal_follows = List.toArray(followed);
    let p2t = func(x : Principal) : Text { Principal.toText(x) };
    Array.map(principal_follows, p2t);
  };

  stable var messages : List.List<Message> = List.nil();
  stable let empty_msg : List.List<Message> = List.nil();
  stable var author : ?Text = null;
  stable let passwd : Passwd = "4399";

  public shared func set_name(otp: Passwd, name: ?Text) : async () {
    assert(otp == passwd);
    author := name;
  };

  public shared query func get_name() : async ?Text {
    author;
  };
   
  public shared func post(otp: Passwd, text: Text) : async () {
    assert(otp == passwd);
    messages := List.push({
      author = author;
      text = text;
      time = Time.now();
    }, messages);
  };

  // public shared (msg) func caller_id() : async Text {
  //   Principal.toText(msg.caller);
  // };

  public shared query func posts() : async [Message] {
    List.toArray(messages);
  };

  public shared func timeline() : async [Message] {
    var all : List.List<Message> = List.nil();

    for (id in Iter.fromList(followed)) {
      let canister : Microblog = actor(Principal.toText(id));
      let msgs = await canister.posts();
      for (msg in Iter.fromArray(msgs)) {
        all := List.push(msg, all);
      };
    };

    List.toArray(all);
  };

  // public shared func specify_posts(id: Text) : async [Message] {
  //   var all : List.List<Message> = List.nil();

  //   let canister : Microblog = actor(id);
  //   let msgs = await canister.posts();
  //   for (msg in Iter.fromArray(msgs)) {
  //     all := List.push(msg, all);
  //   };
  //   List.toArray(all);
  // };
  public shared func unfollow_all(otp : Passwd) : async () {
    assert(otp == passwd);
    followed := empty_followed;
  };

  public shared func clean_posts(otp : Passwd) : async () {
    assert(otp == passwd);
    messages := empty_msg;
  };
};