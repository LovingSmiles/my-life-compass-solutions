(function () {
    // Wait until the DOM is ready
    document.addEventListener("DOMContentLoaded", function () {
      const quoteEl = document.getElementById("quote");
      const sourceEl = document.getElementById("source");
      if (!quoteEl || !sourceEl) return;
  
      // Helper: safely set text
      function setQuote(q) {
        quoteEl.textContent = `"${q.text}"`;
        sourceEl.textContent = `— ${q.source}`;
      }
  
      // Helper: fade utilities (your CSS already has opacity transitions)
      function fadeOut() {
        quoteEl.style.opacity = 0;
        sourceEl.style.opacity = 0;
      }
      function fadeIn() {
        quoteEl.style.opacity = 1;
        sourceEl.style.opacity = 1;
      }
  
      // Build the full quotes list (≈250 total)
      const quotes = [
        // --- (Original starter set ~50) ---
        {text:"Love the Lord and keep His commandments; that is the way to lasting happiness.",source:"Summary of Mosiah 2"},
        {text:"Serve others and you serve God.",source:"Paraphrase of Mosiah 2:17"},
        {text:"Press forward in Christ with hope and love.",source:"Summary of 2 Nephi 31:20"},
        {text:"Faith leads to miracles; doubt blocks them.",source:"Inspired thought"},
        {text:"Charity never fails.",source:"1 Corinthians 13"},
        {text:"Be still and know that God is God.",source:"Psalm 46"},
        {text:"Walk uprightly before the Lord and He will direct your path.",source:"Summary of Proverbs 3"},
        {text:"When life feels heavy, remember that grace is sufficient.",source:"Echo of Ether 12"},
        {text:"God’s tender mercies reach all who trust Him.",source:"1 Nephi 1"},
        {text:"Ask and it shall be given; seek and you shall find.",source:"Matthew 7"},
        {text:"If ye have faith as a grain of mustard seed, ye can move mountains.",source:"Matthew 17"},
        {text:"Come unto Christ and be perfected in Him.",source:"Summary of Moroni 10"},
        {text:"Cleave unto truth and light will grow within you.",source:"Doctrine & Covenants 50"},
        {text:"The Lord will go before you and prepare the way.",source:"1 Nephi 3"},
        {text:"Endure in patience and joy will follow.",source:"Doctrine & Covenants 121"},
        {text:"Peace comes through the Spirit of Christ.",source:"Moroni 7"},
        {text:"Choose the right even when it’s hard.",source:"Children’s Hymn Principle"},
        {text:"Small acts of faith open great doors of blessing.",source:"President Russell M. Nelson — paraphrase"},
        {text:"Joy comes when we focus on the Savior.",source:"President Nelson — paraphrase"},
        {text:"The future is as bright as your faith.",source:"President Thomas S. Monson"},
        {text:"Doubt your doubts before you doubt your faith.",source:"Elder Dieter F. Uchtdorf"},
        {text:"Look for the good and you will find God’s hand in your life.",source:"President Henry B. Eyring — paraphrase"},
        {text:"The gospel is the plan of happiness.",source:"President Gordon B. Hinckley — summary"},
        {text:"Prayer is the key that opens heaven’s door.",source:"President Spencer W. Kimball — summary"},
        {text:"Stand in holy places and be not moved.",source:"Doctrine & Covenants 87"},
        {text:"Faith in Jesus Christ is the greatest power we possess.",source:"President Nelson — summary"},
        {text:"Kindness is a language the deaf can hear and the blind can see.",source:"Mark Twain — often quoted in LDS talks"},
        {text:"True disciples lift others.",source:"Elder Jeffrey R. Holland — summary"},
        {text:"Heaven is cheering you on today, tomorrow, and forever.",source:"Elder Holland — paraphrase"},
        {text:"Hope is never lost when our trust is in Christ.",source:"Elder Neil L. Andersen — summary"},
        {text:"The temple is a place of learning, peace, and promise.",source:"President Howard W. Hunter — summary"},
        {text:"Repentance is not punishment; it is the path to peace.",source:"President Nelson — summary"},
        {text:"Choose to be grateful no matter what.",source:"President Uchtdorf — summary"},
        {text:"Lift where you stand.",source:"President Dieter F. Uchtdorf"},
        {text:"Happiness is found in the journey of becoming like the Savior.",source:"President Nelson — summary"},
        {text:"Christ’s grace is sufficient for all who humble themselves.",source:"Summary of Ether 12"},
        {text:"Look to God and live.",source:"Alma 37"},
        {text:"By small and simple things are great things brought to pass.",source:"Alma 37"},
        {text:"Trust in the Lord with all thine heart.",source:"Proverbs 3"},
        {text:"Peace I leave with you, my peace I give unto you.",source:"John 14:27"},
        {text:"Faith builds bridges to eternal joy.",source:"Inspired thought"},
        {text:"Be kind and patient; every soul is fighting a hard battle.",source:"Adapted proverb"},
        {text:"Through Christ we can do all things.",source:"Philippians 4:13"},
        {text:"Happiness is the purpose and design of existence.",source:"President David O. McKay"},
        {text:"God will make more out of your life than you can imagine.",source:"President Hinckley"},
        {text:"True peace comes when we trust God more than our fears.",source:"President Nelson — summary"},
        {text:"Light will always chase away darkness.",source:"John 1 — summary"},
        {text:"When we serve with love, we become more like Him.",source:"Mosiah 2 — summary"},
        {text:"Gratitude turns ordinary days into blessings.",source:"President Uchtdorf — paraphrase"},
        {text:"He knows you perfectly and loves you eternally.",source:"President Nelson — paraphrase"},
        {text:"Stand tall in truth and light will follow.",source:"Doctrine & Covenants — summary"},
  
        // --- (First extra 100) ---
        { text: "The Lord strengthens those who put their trust in Him.", source: "Alma 36" },
        { text: "Your worth is great in the sight of God.", source: "Doctrine & Covenants 18:10" },
        { text: "The Lord knows the desires of your heart and will guide you.", source: "President Henry B. Eyring" },
        { text: "When you cannot do it alone, remember you were never meant to.", source: "Elder Jeffrey R. Holland" },
        { text: "Faith always points to the future.", source: "Elder Quentin L. Cook" },
        { text: "There is no darkness so deep that light cannot reach it.", source: "President Dieter F. Uchtdorf" },
        { text: "God is aware of you right now and loves you perfectly.", source: "President Russell M. Nelson" },
        { text: "Miracles come when we trust in the timing of the Lord.", source: "Elder Neil L. Andersen" },
        { text: "Obedience brings blessings; exact obedience brings miracles.", source: "President Thomas S. Monson" },
        { text: "Patience is faith applied.", source: "President Uchtdorf" },
        { text: "The temple is a house of peace, learning, and eternal promises.", source: "President Howard W. Hunter" },
        { text: "The gospel of Jesus Christ is the sure foundation in a changing world.", source: "President Gordon B. Hinckley" },
        { text: "If we listen, God will tell us what to do and when to do it.", source: "President Eyring" },
        { text: "True love is founded in the gospel of Jesus Christ.", source: "President Spencer W. Kimball" },
        { text: "The Lord never tires of reaching out to lift us.", source: "Elder Dieter F. Uchtdorf" },
        { text: "Heavenly Father’s plan is a plan of happiness and hope.", source: "President Nelson" },
        { text: "Gratitude unlocks the fullness of life.", source: "President Uchtdorf" },
        { text: "Courage is born from faith, not fear.", source: "Elder Bednar" },
        { text: "We are never alone when we walk with Christ.", source: "President Monson" },
        { text: "Kindness is an expression of true discipleship.", source: "Elder Uchtdorf" },
        { text: "There is power in daily prayer and scripture study.", source: "President Nelson" },
        { text: "Peace comes not from the absence of trouble but from the presence of Christ.", source: "Elder Maxwell" },
        { text: "The Lord loves effort, because effort brings rewards.", source: "President Nelson" },
        { text: "Joy is not found in things, but in Him.", source: "Elder Uchtdorf" },
        { text: "God’s love is not earned; it is freely given.", source: "Elder Renlund" },
        { text: "Your trials do not define you; they refine you.", source: "Elder Holland" },
        { text: "Faith is the bridge between where we are and where God wants us to be.", source: "Inspired thought" },
        { text: "Every choice we make is a brushstroke on the canvas of eternity.", source: "Inspired thought" },
        { text: "Christ is the light that never fades.", source: "3 Nephi 18" },
        { text: "Hold fast to what you know when everything else feels uncertain.", source: "Elder Holland" },
        { text: "Forgiveness heals the heart faster than resentment ever could.", source: "President Nelson" },
        { text: "When you lift another, you rise a little higher yourself.", source: "President Hinckley" },
        { text: "The Savior’s arms are always outstretched toward you.", source: "2 Nephi 28:32" },
        { text: "To be humble is to recognize our dependence on God.", source: "Mosiah 4" },
        { text: "Happiness is found in the quiet assurance of being right with God.", source: "President Kimball" },
        { text: "Our covenants are anchors in the storms of life.", source: "President Nelson" },
        { text: "Prayer draws us closer to heaven than anything else we do.", source: "President Eyring" },
        { text: "The scriptures are love letters from Heaven.", source: "Inspired thought" },
        { text: "Forgive quickly, love deeply, trust God fully.", source: "Inspired thought" },
        { text: "Patience is trusting God’s timeline.", source: "President Nelson" },
        { text: "You are never invisible to the One who created you.", source: "Elder Holland" },
        { text: "When you stand with Christ, you never stand alone.", source: "President Nelson" },
        { text: "Hope is faith holding out its hand in the dark.", source: "Elder Maxwell" },
        { text: "Angels surround those who serve and love the Lord.", source: "Doctrine & Covenants 84" },
        { text: "Christ will calm your storms when you invite Him aboard.", source: "Mark 4 — summary" },
        { text: "Faith is more than believing; it’s acting on that belief.", source: "Elder Andersen" },
        { text: "Each sunrise is a reminder that second chances are real.", source: "Inspired thought" },
        { text: "Heavenly Father answers every prayer in His time and way.", source: "President Hinckley" },
        { text: "You can do hard things through Christ who strengthens you.", source: "Philippians 4:13 — paraphrase" },
        { text: "Hold to the rod; it will not fail you.", source: "1 Nephi 8" },
        { text: "Trust the process of becoming who God wants you to be.", source: "President Nelson" },
        { text: "Sometimes God calms the storm, and sometimes He calms His child.", source: "Inspired thought" },
        { text: "Peace begins when we invite the Spirit in.", source: "3 Nephi 19" },
        { text: "Service is the heartbeat of discipleship.", source: "Mosiah 2 — summary" },
        { text: "Christ is the strength of the weak and the hope of the weary.", source: "Ether 12" },
        { text: "The closer we draw to Christ, the clearer we see ourselves.", source: "Elder Uchtdorf" },
        { text: "True joy comes from living in harmony with God’s commandments.", source: "President Hinckley" },
        { text: "Repentance is an invitation to start again, not a punishment.", source: "President Nelson" },
        { text: "The Spirit whispers truth to humble hearts.", source: "Doctrine & Covenants 8" },
        { text: "Heaven feels closer when we serve one another.", source: "Elder Eyring" },
        { text: "Even the smallest faith can light the darkest night.", source: "Alma 32" },
        { text: "Never let a bad day convince you that you have a bad life.", source: "Inspired thought" },
        { text: "God’s plan is about progress, not perfection.", source: "President Nelson" },
        { text: "Prayer is a conversation, not a monologue.", source: "President Hinckley" },
        { text: "Christ is the answer to every fear, doubt, and question.", source: "President Nelson" },
        { text: "Your journey matters because you matter to God.", source: "Inspired thought" },
        { text: "Faith is choosing to believe even when you can’t see the whole path.", source: "Elder Holland" },
        { text: "The Lord will make a way for those who keep His commandments.", source: "1 Nephi 17" },
        { text: "Every act of kindness invites heaven closer to earth.", source: "Inspired thought" },
        { text: "God’s timing is always perfect, even when it’s not ours.", source: "President Eyring" },
        { text: "Covenants are promises from a perfect God to imperfect people.", source: "President Nelson" },
        { text: "You are a beloved child of Heavenly Parents.", source: "The Family: A Proclamation to the World" },
        { text: "Christ never gives up on anyone; neither should we.", source: "Elder Holland" },
        { text: "Let your faith be bigger than your fear.", source: "Inspired thought" },
        { text: "The Lord knows the way, even when we do not.", source: "Elder Eyring" },
        { text: "Love is the purest expression of the gospel.", source: "President Hinckley" },
        { text: "Where there is love, there is light.", source: "1 John 4:8 — summary" },
        { text: "Don’t just endure to the end; enjoy to the end.", source: "President Uchtdorf" },
        { text: "You are not forgotten. Heaven is aware of you.", source: "President Nelson" },
        { text: "Christ’s atonement is the heart of God’s plan.", source: "President Nelson" },
        { text: "Forgiveness is freeing both the giver and the receiver.", source: "Elder Holland" },
        { text: "Faith is trusting God even when you don’t understand His plan.", source: "President Nelson" },
        { text: "Let God be the author of your story.", source: "Inspired thought" },
        { text: "Heaven is closer when hearts are united in prayer.", source: "President Eyring" },
        { text: "Every temple is a beacon of eternal truth.", source: "President Nelson" },
        { text: "Your past doesn’t define your potential.", source: "President Uchtdorf" },
        { text: "To walk with Christ is to walk in peace.", source: "President Nelson" },
        { text: "The Spirit can calm any storm within the heart.", source: "Doctrine & Covenants 121" },
        { text: "Lift your eyes to the mountains; help comes from the Lord.", source: "Psalm 121" },
        { text: "Live so that those who know you will want to know Christ.", source: "President Hinckley" },
        { text: "When life feels heavy, remember the Savior already carried the weight.", source: "President Nelson" },
        { text: "Faith turns obstacles into stepping stones.", source: "Inspired thought" },
        { text: "God’s love is constant, even when we are not.", source: "President Nelson" },
        { text: "Happiness is found in living the gospel daily.", source: "President Hinckley" },
        { text: "The light of Christ is within every soul.", source: "Moroni 7" },
        { text: "To forgive is to follow the Savior’s example.", source: "Elder Holland" },
        { text: "Peace is the promise of those who follow Him.", source: "John 14:27 — paraphrase" },
        { text: "The Lord’s arms of mercy are extended toward you.", source: "Alma 5" },
        { text: "Trust Him; He knows how to get you home.", source: "President Nelson" },
        { text: "Hope is the anchor of the soul.", source: "Ether 12:4" },
        { text: "Your story is not over; God is still writing it.", source: "Inspired thought" },
  
        // --- (Second extra 100) ---
        { text: "Let your light so shine that others may see Christ through you.", source: "Matthew 5:16" },
        { text: "Every prayer is heard, every tear is noticed.", source: "President Russell M. Nelson" },
        { text: "Choose faith over fear, love over doubt, and hope over despair.", source: "Inspired thought" },
        { text: "The Lord’s timing is perfect, even when our patience isn’t.", source: "Elder Dieter F. Uchtdorf" },
        { text: "When you can’t see the way forward, trust the One who can.", source: "President Henry B. Eyring" },
        { text: "The Savior will meet you where you are but never leave you there.", source: "Elder Jeffrey R. Holland" },
        { text: "Through small daily choices, we become who we are meant to be.", source: "President Nelson" },
        { text: "When we forgive, we free our hearts to feel God’s peace.", source: "Elder Holland" },
        { text: "No righteous effort is ever wasted.", source: "President Hinckley" },
        { text: "Be strong and of good courage, for the Lord thy God is with thee.", source: "Joshua 1:9" },
        { text: "Heavenly Father knows your potential better than you do.", source: "President Nelson" },
        { text: "The light of Christ will guide you home.", source: "3 Nephi 18 — summary" },
        { text: "Let go of the past and hold on to hope.", source: "Inspired thought" },
        { text: "To love as Christ loves is to see others as He does.", source: "Elder Renlund" },
        { text: "Even in silence, God speaks peace to the humble heart.", source: "Inspired thought" },
        { text: "When you lift another, your spirit rises too.", source: "President Hinckley" },
        { text: "Faith and fear cannot dwell in the same heart.", source: "President Nelson" },
        { text: "Stand firm in your faith; the Lord stands with you.", source: "Doctrine & Covenants 6:36" },
        { text: "True strength is found in meekness and mercy.", source: "Alma 7" },
        { text: "Heaven rejoices when we choose kindness.", source: "Inspired thought" },
        { text: "God’s love is constant, no matter how far we’ve wandered.", source: "President Uchtdorf" },
        { text: "Every sunrise reminds us that God keeps His promises.", source: "Inspired thought" },
        { text: "We walk by faith, not by sight.", source: "2 Corinthians 5:7" },
        { text: "Enduring to the end is really enduring with Him.", source: "President Nelson" },
        { text: "The Lord will fight your battles when you stand in truth.", source: "Exodus 14:14" },
        { text: "Live with integrity; heaven is watching and cheering you on.", source: "Elder Holland" },
        { text: "Happiness comes when we align our will with God’s will.", source: "President Eyring" },
        { text: "Sometimes faith means taking one more step when you can’t see the path.", source: "Inspired thought" },
        { text: "Trust God’s no, because His yes is coming in a better way.", source: "Inspired thought" },
        { text: "Heavenly Father has a plan perfectly suited for you.", source: "President Nelson" },
        { text: "The Lord turns broken hearts into strong testimonies.", source: "Elder Holland" },
        { text: "When you feel lost, remember who you are and whose you are.", source: "President Uchtdorf" },
        { text: "Christ’s compassion changes everything.", source: "President Nelson" },
        { text: "Faith grows when we act, not when we wait.", source: "Elder Bednar" },
        { text: "God’s promises are sure; His timing is perfect.", source: "President Hinckley" },
        { text: "Peace is not the absence of pain but the presence of Christ.", source: "Elder Holland" },
        { text: "Courage is fear that has said its prayers.", source: "President Monson" },
        { text: "Heaven’s help is closer than you think.", source: "President Eyring" },
        { text: "True joy comes from living for something eternal.", source: "President Nelson" },
        { text: "Let your heart be full of thanks and your life will be full of joy.", source: "President Uchtdorf" },
        { text: "When you pray, God listens; when you trust, He works.", source: "Inspired thought" },
        { text: "Sometimes the answer is not to be delivered but to be strengthened.", source: "Elder Bednar" },
        { text: "The Lord sees more in you than you see in yourself.", source: "President Nelson" },
        { text: "Your faith in Jesus Christ unlocks heaven’s power.", source: "President Nelson" },
        { text: "Never postpone a prompting.", source: "President Monson" },
        { text: "The temple is a place where heaven and earth meet.", source: "President Nelson" },
        { text: "Holiness is happiness.", source: "President Hinckley" },
        { text: "The Lord blesses those who remember Him in gratitude.", source: "President Uchtdorf" },
        { text: "Every covenant made is a step toward the Savior.", source: "President Nelson" },
        { text: "Don’t underestimate the quiet power of a righteous life.", source: "President Eyring" },
        { text: "Be faithful in the small things; they prepare you for the great.", source: "President Hinckley" },
        { text: "There is beauty in repentance; it is the path to freedom.", source: "President Nelson" },
        { text: "God gives us trials so we can discover our strength.", source: "Elder Holland" },
        { text: "You are known, loved, and remembered in heaven.", source: "President Nelson" },
        { text: "The Savior’s love heals every wound.", source: "Elder Holland" },
        { text: "The Lord never expects perfection, only progression.", source: "President Nelson" },
        { text: "When we remember the Savior, we receive His peace.", source: "3 Nephi 18:7" },
        { text: "Faith is stronger than fear when rooted in Christ.", source: "Elder Bednar" },
        { text: "Gratitude turns ordinary moments into sacred ones.", source: "President Uchtdorf" },
        { text: "The Spirit teaches truth in the language of peace.", source: "Doctrine & Covenants 6:23" },
        { text: "Your obedience is your testimony of love for God.", source: "John 14:15 — summary" },
        { text: "Trust Him enough to let go of what holds you back.", source: "Inspired thought" },
        { text: "Every heart that turns to Christ finds rest.", source: "Matthew 11:28" },
        { text: "When you serve others, you serve your Savior.", source: "Mosiah 2:17" },
        { text: "Stand tall, stand firm, stand faithful.", source: "President Hinckley" },
        { text: "Seek spiritual strength daily through prayer and scripture.", source: "President Nelson" },
        { text: "You were born to make a difference for good.", source: "President Monson" },
        { text: "God will never ask you to give up something without giving you something better.", source: "Elder Holland" },
        { text: "Live the gospel joyfully and invite others to the light.", source: "President Nelson" },
        { text: "Faith in every footstep leads to miracles.", source: "Inspired thought" },
        { text: "Heavenly Father can turn your weakness into strength.", source: "Ether 12:27" },
        { text: "Love is the essence of the gospel.", source: "President Monson" },
        { text: "Peace flows when we trust and follow Christ.", source: "Elder Eyring" },
        { text: "Courage means moving forward even when afraid.", source: "Elder Holland" },
        { text: "The Savior knows how to succor His people.", source: "Alma 7:12" },
        { text: "The more we love God, the less we fear man.", source: "President Hinckley" },
        { text: "Every good thing begins with faith.", source: "President Nelson" },
        { text: "Joy comes when we choose gratitude over comparison.", source: "President Uchtdorf" },
        { text: "You are never too far gone for God’s grace to reach you.", source: "Elder Holland" },
        { text: "Let the gospel light shine in your countenance.", source: "President Hinckley" },
        { text: "Christ is the anchor of every hopeful soul.", source: "Ether 12:4" },
        { text: "Seek first the kingdom of God and everything else will fall into place.", source: "Matthew 6:33" },
        { text: "When you kneel in prayer, you stand in strength.", source: "Inspired thought" },
        { text: "Heavenly Father delights in our efforts, not our perfection.", source: "President Nelson" },
        { text: "Trust that every closed door leads to a better one.", source: "Inspired thought" },
        { text: "Even miracles begin with a small act of faith.", source: "Inspired thought" },
        { text: "God’s grace is greater than your greatest weakness.", source: "President Nelson" },
        { text: "Be the reason someone believes in the goodness of God.", source: "Inspired thought" },
        { text: "The Lord strengthens the humble and lifts the weary.", source: "Psalm 147" },
        { text: "Peace is possible through forgiveness and faith.", source: "Elder Holland" },
        { text: "Your purpose is eternal; never forget who sent you.", source: "President Nelson" },
        { text: "Stand as a witness of God at all times and in all things.", source: "Mosiah 18:9" },
        { text: "Every trial is temporary; eternal joy is forever.", source: "President Nelson" },
        { text: "Faith will always point you home.", source: "Inspired thought" },
        { text: "When you live the gospel, your life becomes a light.", source: "President Monson" },
        { text: "God’s plan for you is bigger than your mistakes.", source: "Elder Holland" },
        { text: "Each day is a new chance to choose Christ.", source: "President Nelson" },
        { text: "Joy is the natural result of a life centered on Christ.", source: "President Nelson" },
        { text: "No effort to love, serve, or forgive is ever wasted.", source: "Elder Uchtdorf" },
        { text: "Let God’s light heal what the world has broken.", source: "Inspired thought" },
        { text: "Faith opens the door; obedience keeps it open.", source: "President Hinckley" },
        { text: "The Spirit of the Lord fills the hearts of the faithful.", source: "Doctrine & Covenants 84:88" },
        { text: "He who kneels to pray can stand against anything.", source: "Inspired thought" },
        { text: "You are never too small for God’s plan or His love.", source: "President Nelson" }
      ];
  
      // Shuffle so we don’t repeat too soon
      function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }
  
      const pool = shuffle(quotes.slice());
      let idx = 0;
  
      function nextQuote() {
        // fade out, swap text, fade in
        fadeOut();
        setTimeout(() => {
          const q = pool[idx];
          setQuote(q);
          fadeIn();
          idx = (idx + 1) % pool.length;
          // reshuffle when we loop back to keep it fresh
          if (idx === 0) shuffle(pool);
        }, 600); // match your CSS fade (~1s total looks smooth)
      }
  
      // Show first quote
      nextQuote();
  
      // Then rotate every 10 seconds
      setInterval(nextQuote, 10000);
    });
  })();