const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYER';

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Danh Phận",
      singer: "Jang Mi",
      path: "/assets/music/danhphan.mp3",
      image: "/assets/img/danhphan.jpg",
    },
    {
      name: "Hiện Đại",
      singer: "Khắc Việt",
      path: "/assets/music/hiendai.mp3",
      image: "/assets/img/hiendai.jpg",
    },
    {
      name: "Em Là Hoa Có Gai",
      singer: "Phương Anh, Thằng Bờm",
      path: "/assets/music/hoacogai.mp3",
      image: "/assets/img/hoacogai.jpg",
    },
    {
      name: "Nắm Đôi Bàn Tay",
      singer: "Khắc Việt",
      path: "/assets/music/namdoibantay.mp3",
      image: "/assets/img/namdoibantay.jpg",
    },
    {
      name: "Nước Mắt Đóng Băng",
      singer: "Hồ Quang Hiếu",
      path: "/assets/music/nuomatdongbang.mp3",
      image: "/assets/img/nuocmatdongbang.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? "active" : ""
        }" data-index="${index}">
          <div class="thumb"
              style="background-image: url(${song.image})">
          </div>
          <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
          </div>
          <div class="option">
              <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },
  defindProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
      }
    );
    cdThumbAnimate.pause();
    // Xử lý phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi bài hát được phát
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi bài hát bị dừng
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const currentPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = currentPercent;
      }
    };

    // Xử lý khi tua bài hát
    progress.onchange = function (e) {
      const seekTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    };

    // Khi next bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    // Khi prev bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi random bài hát
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Xử lý lặp lại bài hát
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      const optionNode = e.target.closest(".option");
      if (songNode || optionNode) {
        // Xử lý khi click vào bài hát
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          audio.play();
          _this.render();
        }
        // Xử lý option
        if (optionNode) {

        }
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    if (this.currentIndex === 0) {
      this.currentIndex = this.songs.length;
    }
    this.currentIndex--;
    this.loadCurrentSong();
  },
  randomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
  },
  start: function () {
    // Load config
    this.loadConfig();
    // Định nghĩa các thuộc tính cho object
    this.defindProperties();

    // Lắng nghe các sự kiện(DOM EVENTS)
    this.handleEvents();

    // Tải thông tin bài hát vào UI
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // Hiển thị trạng thái active
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};
app.start();
