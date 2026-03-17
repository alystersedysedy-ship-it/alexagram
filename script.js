// Elements
const toggleThemeBtn = document.querySelector('.header__theme-button');
const storiesContent = document.querySelector('.stories__content');
const storiesLeftButton = document.querySelector('.stories__left-button');
const storiesRightButton = document.querySelector('.stories__right-button');
const storyButtons = Array.from(document.querySelectorAll('.story'));
const posts = document.querySelectorAll('.post');
const postsContent = document.querySelectorAll('.post__content');
const postActionState = JSON.parse(localStorage.getItem('postActionState') || '{}');
const STORY_SLIDE_DURATION = 3200;

const heartIconOutline = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.4995 21.2609C11.1062 21.2609 10.7307 21.1362 10.4133 20.9001C8.2588 19.3012 3.10938 15.3239 1.81755 12.9143C0.127895 9.76543 1.14258 5.72131 4.07489 3.89968C5.02253 3.31177 6.09533 3 7.18601 3C8.81755 3 10.3508 3.66808 11.4995 4.85726C12.6483 3.66808 14.1815 3 15.8131 3C16.9038 3 17.9766 3.31177 18.9242 3.89968C21.8565 5.72131 22.8712 9.76543 21.186 12.9143C19.8942 15.3239 14.7448 19.3012 12.5902 20.9001C12.2684 21.1362 11.8929 21.2609 11.4995 21.2609ZM7.18601 4.33616C6.34565 4.33616 5.5187 4.57667 4.78562 5.03096C2.43888 6.49183 1.63428 9.74316 2.99763 12.2819C4.19558 14.5177 9.58639 18.6242 11.209 19.8267C11.3789 19.9514 11.6158 19.9514 11.7856 19.8267C13.4082 18.6197 18.799 14.5133 19.997 12.2819C21.3603 9.74316 20.5557 6.48738 18.209 5.03096C17.4804 4.57667 16.6534 4.33616 15.8131 4.33616C14.3425 4.33616 12.9657 5.04878 12.0359 6.28696L11.4995 7.00848L10.9631 6.28696C10.0334 5.04878 8.6611 4.33616 7.18601 4.33616Z"
      fill="var(--text-dark)"
      stroke="var(--text-dark)"
      stroke-width="0.6"
    />
  </svg>
`;

const heartIconFilled = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.5 20.2C11.2 20.2 10.9 20.1 10.7 19.9C8.6 18.4 3.8 14.7 2.7 12.5C1.2 9.7 2 6.1 4.5 4.5C5.3 4 6.2 3.7 7.2 3.7C8.7 3.7 10.1 4.3 11.1 5.4L11.5 5.8L11.9 5.4C12.9 4.3 14.3 3.7 15.8 3.7C16.8 3.7 17.7 4 18.5 4.5C21 6.1 21.8 9.7 20.3 12.5C19.2 14.7 14.4 18.4 12.3 19.9C12.1 20.1 11.8 20.2 11.5 20.2Z"
      fill="var(--like)"
      stroke="var(--like)"
      stroke-width="0.6"
    />
  </svg>
`;

// ===================================
// DARK/LIGHT THEME
// Set initial theme from LocalStorage
document.onload = setInitialTheme(localStorage.getItem('theme'));
function setInitialTheme(themeKey) {
  if (themeKey === 'dark') {
    document.documentElement.classList.add('darkTheme');
  } else {
    document.documentElement.classList.remove('darkTheme');
  }
}

// Toggle theme button
toggleThemeBtn.addEventListener('click', () => {
  // Toggle root class
  document.documentElement.classList.toggle('darkTheme');

  // Saving current theme on LocalStorage
  if (document.documentElement.classList.contains('darkTheme')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// ===================================
// STORIES SCROLL BUTTONS
// Scrolling stories content
storiesLeftButton.addEventListener('click', () => {
  storiesContent.scrollLeft -= 320;
});
storiesRightButton.addEventListener('click', () => {
  storiesContent.scrollLeft += 320;
});

// Checking if screen has minimun size of 1024px
if (window.matchMedia('(min-width: 1024px)').matches) {
  // Observer to hide buttons when necessary
  const storiesObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.target === document.querySelector('.story:first-child')) {
          storiesLeftButton.style.display = entry.isIntersecting
            ? 'none'
            : 'unset';
        } else if (
          entry.target === document.querySelector('.story:last-child')
        ) {
          storiesRightButton.style.display = entry.isIntersecting
            ? 'none'
            : 'unset';
        }
      });
    },
    { root: storiesContent, threshold: 1 }
  );

  // Calling the observer with the first and last stories
  storiesObserver.observe(document.querySelector('.story:first-child'));
  storiesObserver.observe(document.querySelector('.story:last-child'));
}

// ===================================
// STORIES VIEWER (POPUP)
if (storyButtons.length > 0) {
  let storySeenState = {};

  function getStorySeenKey(storyIndex) {
    return `story-${storyIndex}`;
  }

  function isStorySeen(storyIndex) {
    return Boolean(storySeenState[getStorySeenKey(storyIndex)]);
  }

  function updateStoryRing(storyIndex) {
    const button = storyButtons[storyIndex];
    if (!button) return;
    button.classList.toggle('story--has-story', !isStorySeen(storyIndex));
  }

  const storyMediaPool = Array.from(document.querySelectorAll('.post__media'))
    .map((media) => media.getAttribute('src'))
    .filter(Boolean);

  function getStoryImageFromPool(poolIndex, fallback) {
    if (storyMediaPool.length === 0) return fallback;
    return storyMediaPool[poolIndex % storyMediaPool.length];
  }

  const storyDecks = storyButtons.map((storyButton, index) => {
    const storyName =
      storyButton.querySelector('.story__user')?.textContent?.trim() ||
      `story ${index + 1}`;
    const avatarSrc =
      storyButton.querySelector('.story__picture img')?.getAttribute('src') ||
      'img/icon.jpg';

    return {
      storyName,
      avatarSrc,
      mediaSources: [
        avatarSrc,
        getStoryImageFromPool(index, avatarSrc),
        getStoryImageFromPool(index + 1, avatarSrc),
      ],
    };
  });

  const storyViewer = document.createElement('div');
  storyViewer.classList.add('story-viewer');
  storyViewer.setAttribute('aria-hidden', 'true');
  storyViewer.innerHTML = `
    <div class="story-viewer__backdrop"></div>
    <section class="story-viewer__panel" role="dialog" aria-modal="true" aria-label="Story viewer">
      <div class="story-viewer__progress"></div>
      <div class="story-viewer__meta">
        <div class="story-viewer__avatar">
          <img src="img/icon.jpg" alt="" />
        </div>
        <span class="story-viewer__user"></span>
      </div>
      <button class="story-viewer__close" type="button" aria-label="Close story">&times;</button>
      <button class="story-viewer__nav story-viewer__nav--left" type="button" aria-label="Previous story image"></button>
      <button class="story-viewer__nav story-viewer__nav--right" type="button" aria-label="Next story image"></button>
      <img class="story-viewer__image" src="img/icon.jpg" alt="Story image" />
    </section>
  `;
  document.body.appendChild(storyViewer);

  const storyViewerBackdrop = storyViewer.querySelector('.story-viewer__backdrop');
  const storyViewerProgress = storyViewer.querySelector('.story-viewer__progress');
  const storyViewerAvatar = storyViewer.querySelector('.story-viewer__avatar img');
  const storyViewerUser = storyViewer.querySelector('.story-viewer__user');
  const storyViewerImage = storyViewer.querySelector('.story-viewer__image');
  const storyViewerCloseButton = storyViewer.querySelector('.story-viewer__close');
  const storyViewerPreviousButton = storyViewer.querySelector('.story-viewer__nav--left');
  const storyViewerNextButton = storyViewer.querySelector('.story-viewer__nav--right');

  let activeStoryIndex = 0;
  let activeSlideIndex = 0;
  let storyTimeout = null;

  function isStoryViewerOpen() {
    return storyViewer.classList.contains('is-open');
  }

  function clearStoryTimeout() {
    if (storyTimeout !== null) {
      window.clearTimeout(storyTimeout);
      storyTimeout = null;
    }
  }

  function markStoryAsViewed(storyIndex) {
    storySeenState[getStorySeenKey(storyIndex)] = true;
    updateStoryRing(storyIndex);
  }

  function renderStorySlide() {
    const activeStory = storyDecks[activeStoryIndex];
    if (!activeStory) return;

    const activeImage = activeStory.mediaSources[activeSlideIndex];
    storyViewerUser.textContent = activeStory.storyName;
    storyViewerAvatar.src = activeStory.avatarSrc;
    storyViewerAvatar.alt = `${activeStory.storyName} avatar`;
    storyViewerImage.src = activeImage;
    storyViewerImage.alt = `${activeStory.storyName} story`;

    storyViewerProgress.innerHTML = activeStory.mediaSources
      .map((_, index) => {
        let stateClass = '';
        if (index < activeSlideIndex) stateClass = ' is-complete';
        if (index === activeSlideIndex) stateClass = ' is-active';
        return `<span class="story-viewer__progress-item${stateClass}"><span></span></span>`;
      })
      .join('');
  }

  function scheduleStoryAdvance() {
    clearStoryTimeout();
    storyTimeout = window.setTimeout(() => {
      openNextStorySlide();
    }, STORY_SLIDE_DURATION);
  }

  function openStoryViewer(storyIndex, slideIndex = 0) {
    if (storyIndex < 0 || storyIndex >= storyDecks.length) return;
    const slidesCount = storyDecks[storyIndex].mediaSources.length;
    const normalizedSlide = Math.max(0, Math.min(slideIndex, slidesCount - 1));

    activeStoryIndex = storyIndex;
    activeSlideIndex = normalizedSlide;
    markStoryAsViewed(activeStoryIndex);

    storyViewer.classList.add('is-open');
    storyViewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('story-viewer-open');

    renderStorySlide();
    scheduleStoryAdvance();
  }

  function closeStoryViewer() {
    clearStoryTimeout();
    storyViewer.classList.remove('is-open');
    storyViewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('story-viewer-open');
  }

  function openNextStorySlide() {
    const currentStory = storyDecks[activeStoryIndex];
    if (!currentStory) return;

    if (activeSlideIndex < currentStory.mediaSources.length - 1) {
      activeSlideIndex += 1;
      renderStorySlide();
      scheduleStoryAdvance();
      return;
    }

    if (activeStoryIndex < storyDecks.length - 1) {
      openStoryViewer(activeStoryIndex + 1, 0);
      return;
    }

    closeStoryViewer();
  }

  function openPreviousStorySlide() {
    if (activeSlideIndex > 0) {
      activeSlideIndex -= 1;
      renderStorySlide();
      scheduleStoryAdvance();
      return;
    }

    if (activeStoryIndex > 0) {
      const previousStoryIndex = activeStoryIndex - 1;
      const lastSlideIndex = storyDecks[previousStoryIndex].mediaSources.length - 1;
      openStoryViewer(previousStoryIndex, lastSlideIndex);
    }
  }

  storyButtons.forEach((storyButton, index) => {
    updateStoryRing(index);

    const storyName =
      storyButton.querySelector('.story__user')?.textContent?.trim() ||
      `story ${index + 1}`;
    storyButton.setAttribute('type', 'button');
    storyButton.setAttribute('aria-label', `Open ${storyName} story`);
    storyButton.addEventListener('click', (event) => {
      event.preventDefault();
      openStoryViewer(index, 0);
    });
  });

  storyViewerBackdrop.addEventListener('click', closeStoryViewer);
  storyViewerCloseButton.addEventListener('click', closeStoryViewer);
  storyViewerNextButton.addEventListener('click', openNextStorySlide);
  storyViewerPreviousButton.addEventListener('click', openPreviousStorySlide);

  document.addEventListener('keydown', (event) => {
    if (!isStoryViewerOpen()) return;

    if (event.key === 'Escape') {
      closeStoryViewer();
      return;
    }
    if (event.key === 'ArrowRight') {
      openNextStorySlide();
      return;
    }
    if (event.key === 'ArrowLeft') {
      openPreviousStorySlide();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!isStoryViewerOpen()) return;

    if (document.hidden) {
      clearStoryTimeout();
    } else {
      scheduleStoryAdvance();
    }
  });
}

// ===================================
// POST MULTIPLE MEDIAS
// Creating scroll buttons and indicators when post has more than one media
posts.forEach((post) => {
  if (post.querySelectorAll('.post__media').length > 1) {
    const leftButtonElement = document.createElement('button');
    leftButtonElement.classList.add('post__left-button');
    leftButtonElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="#fff" d="M256 504C119 504 8 393 8 256S119 8 256 8s248 111 248 248-111 248-248 248zM142.1 273l135.5 135.5c9.4 9.4 24.6 9.4 33.9 0l17-17c9.4-9.4 9.4-24.6 0-33.9L226.9 256l101.6-101.6c9.4-9.4 9.4-24.6 0-33.9l-17-17c-9.4-9.4-24.6-9.4-33.9 0L142.1 239c-9.4 9.4-9.4 24.6 0 34z"></path>
      </svg>
    `;

    const rightButtonElement = document.createElement('button');
    rightButtonElement.classList.add('post__right-button');
    rightButtonElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="#fff" d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm113.9 231L234.4 103.5c-9.4-9.4-24.6-9.4-33.9 0l-17 17c-9.4 9.4-9.4 24.6 0 33.9L285.1 256 183.5 357.6c-9.4 9.4-9.4 24.6 0 33.9l17 17c9.4 9.4 24.6 9.4 33.9 0L369.9 273c9.4-9.4 9.4-24.6 0-34z"></path>
      </svg>
    `;

    post.querySelector('.post__content').appendChild(leftButtonElement);
    post.querySelector('.post__content').appendChild(rightButtonElement);

    post.querySelectorAll('.post__media').forEach(function () {
      const postMediaIndicatorElement = document.createElement('div');
      postMediaIndicatorElement.classList.add('post__indicator');

      post
        .querySelector('.post__indicators')
        .appendChild(postMediaIndicatorElement);
    });

    // Observer to change the actual media indicator
    const postMediasContainer = post.querySelector('.post__medias');
    const postMediaIndicators = post.querySelectorAll('.post__indicator');
    const postIndicatorObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Removing all the indicators
            postMediaIndicators.forEach((indicator) =>
              indicator.classList.remove('post__indicator--active')
            );
            // Adding the indicator that matches the current post media
            postMediaIndicators[
              Array.from(postMedias).indexOf(entry.target)
            ].classList.add('post__indicator--active');
          }
        });
      },
      { root: postMediasContainer, threshold: 0.5 }
    );

    // Calling the observer for every post media
    const postMedias = post.querySelectorAll('.post__media');
    postMedias.forEach((media) => {
      postIndicatorObserver.observe(media);
    });
  }
});

// Adding buttons features on every post with multiple medias
postsContent.forEach((post) => {
  if (post.querySelectorAll('.post__media').length > 1) {
    const leftButton = post.querySelector('.post__left-button');
    const rightButton = post.querySelector('.post__right-button');
    const postMediasContainer = post.querySelector('.post__medias');

    // Functions for left and right buttons
    leftButton.addEventListener('click', () => {
      postMediasContainer.scrollLeft -= 400;
    });
    rightButton.addEventListener('click', () => {
      postMediasContainer.scrollLeft += 400;
    });

    // Observer to hide button if necessary
    const postButtonObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.target === post.querySelector('.post__media:first-child')) {
            leftButton.style.display = entry.isIntersecting ? 'none' : 'unset';
          } else if (
            entry.target === post.querySelector('.post__media:last-child')
          ) {
            rightButton.style.display = entry.isIntersecting ? 'none' : 'unset';
          }
        });
      },
      { root: postMediasContainer, threshold: 0.5 }
    );

    if (window.matchMedia('(min-width: 1024px)').matches) {
      postButtonObserver.observe(
        post.querySelector('.post__media:first-child')
      );
      postButtonObserver.observe(post.querySelector('.post__media:last-child'));
    }
  }
});

// ===================================
// POST ACTION BUTTONS (LIKE / COMMENT / SHARE)
const postStatusTimeouts = new WeakMap();

function savePostActionState() {
  localStorage.setItem('postActionState', JSON.stringify(postActionState));
}

function animateButtonPress(button) {
  button.classList.remove('post__button--pressed');
  void button.offsetWidth;
  button.classList.add('post__button--pressed');
}

function setLikeButtonVisual(button, liked) {
  button.classList.toggle('post__button--liked', liked);
  button.setAttribute('aria-pressed', liked ? 'true' : 'false');
  button.innerHTML = liked ? heartIconFilled : heartIconOutline;
}

function showPostStatus(postElement, message) {
  const infos = postElement.querySelector('.post__infos');
  let status = postElement.querySelector('.post__status');

  if (!status) {
    status = document.createElement('span');
    status.classList.add('post__status');
    infos.appendChild(status);
  }

  status.textContent = message;
  status.classList.add('post__status--visible');

  if (postStatusTimeouts.has(status)) {
    clearTimeout(postStatusTimeouts.get(status));
  }

  postStatusTimeouts.set(
    status,
    setTimeout(() => {
      status.classList.remove('post__status--visible');
    }, 1600)
  );
}

posts.forEach((post, index) => {
  const postId = `post-${index + 1}`;
  const postButtons = post.querySelectorAll('.post__button');
  const postFooter = post.querySelector('.post__footer');

  if (postButtons.length < 3 || !postFooter) {
    return;
  }

  const likeButton = postButtons[0];
  const commentButton = postButtons[1];
  const shareButton = postButtons[2];

  likeButton.setAttribute('aria-label', 'Like post');
  commentButton.setAttribute('aria-label', 'Comment on post');
  shareButton.setAttribute('aria-label', 'Share post');

  setLikeButtonVisual(likeButton, Boolean(postActionState[postId]?.liked));

  // Add a simple comment composer so comment icon can focus and post comments.
  const commentForm = document.createElement('form');
  commentForm.classList.add('post__comment-form');
  commentForm.innerHTML = `
    <input
      class="post__comment-input"
      type="text"
      maxlength="120"
      placeholder="Add a comment..."
    />
    <button class="post__comment-submit" type="submit">Post</button>
  `;
  postFooter.appendChild(commentForm);

  const commentInput = commentForm.querySelector('.post__comment-input');
  const commentSubmitButton = commentForm.querySelector('.post__comment-submit');
  commentSubmitButton.disabled = true;

  likeButton.addEventListener('click', () => {
    const liked = !likeButton.classList.contains('post__button--liked');
    setLikeButtonVisual(likeButton, liked);
    animateButtonPress(likeButton);

    postActionState[postId] = {
      ...postActionState[postId],
      liked,
    };
    savePostActionState();
    showPostStatus(post, liked ? 'You liked this post.' : 'Like removed.');
  });

  commentButton.addEventListener('click', () => {
    animateButtonPress(commentButton);
    commentButton.classList.add('post__button--active');
    setTimeout(() => commentButton.classList.remove('post__button--active'), 200);
    commentInput.focus();
  });

  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const comment = commentInput.value.trim();
    if (!comment) return;

    showPostStatus(post, `Comment posted: "${comment.slice(0, 28)}${comment.length > 28 ? '...' : ''}"`);
    commentInput.value = '';
    commentSubmitButton.disabled = true;
  });

  commentInput.addEventListener('input', () => {
    commentSubmitButton.disabled = !commentInput.value.trim();
  });

  shareButton.addEventListener('click', async () => {
    animateButtonPress(shareButton);
    shareButton.classList.add('post__button--active');
    setTimeout(() => shareButton.classList.remove('post__button--active'), 200);

    const shareLink = `${window.location.href.split('#')[0]}#${postId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      showPostStatus(post, 'Post link copied.');
    } catch (error) {
      showPostStatus(post, 'Copy failed. You can still share this page URL.');
    }
  });
});
