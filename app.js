/**
 * Niwatori Games – トップページ
 * タブ切替・セクション描画・data/feed.json 読み込み（未存在時はダミーデータ）
 */

(function () {
  'use strict';

  const TAB_IDS = ['top', 'game', 'hobby', 'article', 'trending', 'recommended'];

  /**
   * feed.json 想定スキーマ（コメント）
   * {
   *   "items": [
   *     {
   *       "id": "string",
   *       "type": "game" | "post",
   *       "title": "string",
   *       "thumbnail": "url | null",
   *       "category": "string",
   *       "time": "string (表示用)",
   *       "badge": "string | null",
   *       "url": "string | null",
   *       "score": number,           // 並び順用
   *       "trendingScore": number,   // 急上昇用（大きいほど上）
   *       "recommendedScore": number // おすすめ用（大きいほど上）
   *     }
   *   ]
   * }
   */

  const DUMMY_FEED = {
    items: [
      { id: '1', type: 'game', title: 'ババ抜き（準備中）', thumbnail: null, category: 'ゲーム', time: '1時間前', badge: 'NEW', url: './games/baba-nuki/', score: 100, trendingScore: 90, recommendedScore: 85 },
      { id: '2', type: 'post', title: '開発ロードマップ公開', thumbnail: null, category: '記事', time: '2時間前', badge: null, url: '/roadmap.html', score: 90, trendingScore: 70, recommendedScore: 80 },
      { id: '3', type: 'post', title: 'サイトオープンのお知らせ', thumbnail: null, category: 'お知らせ', time: '1日前', badge: null, url: null, score: 80, trendingScore: 50, recommendedScore: 60 },
      { id: '4', type: 'game', title: '次のゲーム企画中', thumbnail: null, category: 'ゲーム', time: '3日前', badge: '準備中', url: null, score: 70, trendingScore: 40, recommendedScore: 50 },
      { id: '5', type: 'post', title: '趣味：音楽制作', thumbnail: null, category: '趣味', time: '1週間前', badge: null, url: null, score: 60, trendingScore: 30, recommendedScore: 40 },
    ],
  };

  let feedData = { items: [] };
  let currentTab = 'top';

  function byScore(a, b) {
    return (b.score ?? 0) - (a.score ?? 0);
  }
  function byTrendingScore(a, b) {
    return (b.trendingScore ?? 0) - (a.trendingScore ?? 0);
  }
  function byRecommendedScore(a, b) {
    return (b.recommendedScore ?? 0) - (a.recommendedScore ?? 0);
  }

  function getItemsForTab(tabId) {
    const items = feedData.items || [];
    switch (tabId) {
      case 'game':
        return items.filter(function (i) { return i.type === 'game' || i.category === 'ゲーム'; }).sort(byScore);
      case 'hobby':
        return items.filter(function (i) { return i.category === '趣味'; }).sort(byScore);
      case 'article':
        return items.filter(function (i) { return i.type === 'post' || i.category === '記事' || i.category === 'お知らせ'; }).sort(byScore);
      case 'trending':
        return [...items].sort(byTrendingScore).slice(0, 5);
      case 'recommended':
        return [...items].sort(byRecommendedScore).slice(0, 5);
      case 'top':
      default:
        return [...items].sort(byScore);
    }
  }

  function renderFeedCard(item) {
    const url = item.url || '#';
    const thumb = item.thumbnail
      ? '<img class="thumb" src="' + escapeHtml(item.thumbnail) + '" alt="" loading="lazy" />'
      : '<div class="thumb thumb-placeholder"></div>';
    const badge = item.badge ? '<span class="badge">' + escapeHtml(item.badge) + '</span>' : '';
    return (
      '<a class="feed-card" href="' + escapeHtml(url) + '">' +
        '<div class="thumb-wrap">' + thumb + '</div>' +
        '<div class="body">' +
          '<h3 class="title">' + escapeHtml(item.title) + '</h3>' +
          '<div class="meta">' +
            (item.category ? '<span>' + escapeHtml(item.category) + '</span>' : '') +
            (item.time ? '<span>' + escapeHtml(item.time) + '</span>' : '') +
            badge +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  function renderRowItem(item, className) {
    const url = item.url || '#';
    const thumb = item.thumbnail
      ? '<img class="thumb" src="' + escapeHtml(item.thumbnail) + '" alt="" loading="lazy" />'
      : '<div class="thumb thumb-placeholder"></div>';
    return (
      '<a class="' + className + '" href="' + escapeHtml(url) + '">' +
        thumb +
        '<div class="body">' +
          '<span class="title">' + escapeHtml(item.title) + '</span>' +
          '<div class="meta">' + escapeHtml(item.category || '') + ' · ' + escapeHtml(item.time || '') + '</div>' +
        '</div>' +
      '</a>'
    );
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function hideSkeleton(id) {
    var el = document.getElementById(id);
    if (el) { el.setAttribute('aria-hidden', 'true'); el.classList.add('hidden'); }
  }

  function showContent(id) {
    var el = document.getElementById(id);
    if (el) el.removeAttribute('hidden');
  }

  function renderSections() {
    var items = feedData.items || [];
    var trending = [...items].sort(byTrendingScore).slice(0, 5);
    var recommended = [...items].sort(byRecommendedScore).slice(0, 5);
    var feed = getItemsForTab(currentTab);

    // 急上昇
    var trendingContainer = document.getElementById('trending-items');
    var trendingSkeleton = document.getElementById('trending-skeleton');
    if (trendingContainer && trendingSkeleton) {
      if (trending.length > 0) {
        trendingContainer.innerHTML = trending.map(function (i) { return renderRowItem(i, 'trending-item'); }).join('');
        trendingSkeleton.setAttribute('aria-hidden', 'true');
        trendingSkeleton.classList.add('hidden');
        trendingContainer.removeAttribute('hidden');
      } else {
        trendingContainer.innerHTML = '<p class="meta">急上昇の記事はありません</p>';
        trendingSkeleton.setAttribute('aria-hidden', 'true');
        trendingSkeleton.classList.add('hidden');
        trendingContainer.removeAttribute('hidden');
      }
    }

    // おすすめトピック
    var recContainer = document.getElementById('recommended-items');
    var recSkeleton = document.getElementById('recommended-skeleton');
    if (recContainer && recSkeleton) {
      if (recommended.length > 0) {
        recContainer.innerHTML = recommended.map(function (i) { return renderRowItem(i, 'recommended-item'); }).join('');
        recSkeleton.setAttribute('aria-hidden', 'true');
        recSkeleton.classList.add('hidden');
        recContainer.removeAttribute('hidden');
      } else {
        recContainer.innerHTML = '<p class="meta">おすすめトピックはありません</p>';
        recSkeleton.setAttribute('aria-hidden', 'true');
        recSkeleton.classList.add('hidden');
        recContainer.removeAttribute('hidden');
      }
    }

    // メインフィード
    var feedContainer = document.getElementById('feed-items');
    var feedSkeleton = document.getElementById('feed-skeleton');
    if (feedContainer && feedSkeleton) {
      feedSkeleton.setAttribute('aria-hidden', 'true');
      feedSkeleton.classList.add('hidden');
      if (feed.length > 0) {
        feedContainer.innerHTML = feed.map(renderFeedCard).join('');
      } else {
        feedContainer.innerHTML = '<p class="meta">表示するコンテンツがありません</p>';
      }
      feedContainer.removeAttribute('hidden');
    }
  }

  function switchTab(tabId) {
    currentTab = TAB_IDS.indexOf(tabId) >= 0 ? tabId : 'top';
    var tabs = document.querySelectorAll('.category-tabs .tab');
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute('data-tab') === currentTab;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    renderSections();
  }

  function loadFeed() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/feed.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        try {
          var json = JSON.parse(xhr.responseText);
          feedData = json && Array.isArray(json.items) ? json : { items: json.items || [] };
        } catch (e) {
          feedData = DUMMY_FEED;
        }
      } else {
        feedData = DUMMY_FEED;
      }
      renderSections();
    };
    xhr.send();
  }

  function init() {
    loadFeed();

    document.querySelectorAll('.category-tabs .tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var tabId = tab.getAttribute('data-tab');
        if (tabId) switchTab(tabId);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
