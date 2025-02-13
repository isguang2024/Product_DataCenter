                // 初始化
        document.addEventListener('DOMContentLoaded', () => {
            // 全局变量
            window.sellerNumber = '+8613757736137';
            window.openWhatsappModal = whatsappHandler.openModal;

            // 在获取商品数据之前添加语言检测
            const userLanguage = navigator.language || navigator.userLanguage;
            if (userLanguage.toLowerCase().includes('zh')) {
                // 如果是中文环境，显示提示并终止执行
                document.getElementById('loadingContainer').style.display = 'none';
                const container = document.getElementById('imageContainer');
                container.innerHTML = '<div class="error-message" style="text-align: center; padding: 20px; font-size: 18px;">error</div>';
                // 隐藏所有按钮
                document.querySelector('.bottom-buttons').style.display = 'none';
                document.getElementById('itemNumberButton').style.display = 'none';
                document.getElementById('itemIntroduceButton').style.display = 'none';
                return;
            }

            // 获取数据
            const id = utils.getQueryParam('id') || 'c56eac82075b89a661b6a3b6400209cf';
            fetch(`https://cdn.jsdelivr.net/gh/isguang2024/Product_DataCenter/Product_db_a/${encodeURIComponent(id)}`)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        // 隐藏加载动画
                        document.getElementById('loadingContainer').style.display = 'none';
                        
                        window.ItemNumber = data.info.货号;
                        window.introduce = data.info.商品简介;

                        const creativeImages = data.牌货.SKU创意图 || [];
                        const detailImages = data.牌货.细节 || [];
                        const allImages = [...creativeImages, ...detailImages];

                        if (allImages.length > 0) {
                            // 显示货号按钮
                            const itemNumberButton = document.getElementById('itemNumberButton');
                            itemNumberButton.style.display = 'block';
                            itemNumberButton.textContent = `${window.ItemNumber} (Copy Item No.)`;
                            itemNumberButton.onclick = () => utils.copyToClipboard(window.ItemNumber);

                            // 显示底部按钮容器和WhatsApp按钮
                            document.querySelector('.bottom-buttons').style.display = 'flex';
                            document.querySelector('.whatsapp-button').style.display = 'flex';

                            // 处理简介翻译
                            if (window.introduce) {
                                const introduceButton = document.getElementById('itemIntroduceButton');
                                utils.translateText(window.introduce)
                                    .then(translatedText => {
                                        if (translatedText) {
                                            introduceButton.textContent = translatedText;
                                            introduceButton.style.display = 'block';
                                        }
                                    });
                            }

                            // 先保存所有图片URL
                            imageHandler.loadImages(allImages);
                            
                            // 加载创意图（带序号）
                            const container = document.getElementById('imageContainer');
                            creativeImages.forEach((url, index) => {
                                const wrapper = document.createElement('div');
                                wrapper.className = 'image-wrapper';
                                
                                const numberDiv = document.createElement('div');
                                numberDiv.className = 'image-number';
                                numberDiv.textContent = `No. ${index + 1}`;
                                wrapper.appendChild(numberDiv);
                                
                                const img = document.createElement('img');
                                img.src = url;
                                img.alt = 'Product image';
                                img.loading = "lazy";
                                img.onclick = () => imageHandler.openModal(index);
                                wrapper.appendChild(img);
                                container.appendChild(wrapper);
                            });

                            // 添加分隔线
                            if (detailImages.length > 0) {
                                const divider = document.createElement('div');
                                divider.className = 'details-divider';
                                divider.textContent = 'More Details';
                                container.appendChild(divider);
                            }

                            // 加载细节图片（不显示序号）
                            detailImages.forEach((url, index) => {
                                const wrapper = document.createElement('div');
                                wrapper.className = 'image-wrapper';
                                const img = document.createElement('img');
                                img.src = url;
                                img.alt = 'Product detail';
                                img.loading = "lazy";
                                img.onclick = () => imageHandler.openModal(creativeImages.length + index);  // 使用正确的索引
                                wrapper.appendChild(img);
                                container.appendChild(wrapper);
                            });

                            // 处理购买按钮和提示
                            const shoppingId = utils.getQueryParam('shopping');
                            if (shoppingId) {
                                const buyButton = document.getElementById('buyButton');
                                const buyTip = document.getElementById('buyTip');
                                
                                // 显示购买按钮
                                buyButton.style.display = 'flex';
                                
                                // 显示购买提示
                                buyTip.style.display = 'block';
                                
                                buyButton.onclick = () => {
                                    window.location.href = `https://m.aliexpress.com/app/product_sku.html?productId=${shoppingId}`;
                                };
                            }
                        } else {
                            throw new Error('No images found');
                        }
                    } else {
                        throw new Error('Invalid data format');
                    }
                })
                .catch(() => {
                    // 显示错误信息，隐藏加载动画
                    document.getElementById('loadingContainer').style.display = 'none';
                    document.getElementById('imageContainer').innerHTML = '<p class="error-message">Product not found</p>';
                });

            // 初始化事件
            const modal = document.getElementById('myModal');
            document.querySelector('.close').onclick = imageHandler.closeModal;
            modal.onclick = (e) => {
                if (e.target === modal) imageHandler.closeModal();
            };

            whatsappHandler.init();
            imageHandler.initEvents();
        });
        
        // 工具函数
        const utils = {
            getQueryParam(param) {
                return new URLSearchParams(window.location.search).get(param);
            },
            
            handleScroll(action) {
                if (action === 'lock') {
                    const scrollY = window.pageYOffset;
                    document.body.style.top = `-${scrollY}px`;
                    document.body.classList.add('body-fixed');
                    return scrollY;
                } else {
                    const scrollY = parseInt(document.body.style.top || '0');
                    document.body.classList.remove('body-fixed');
                    document.body.style.top = '';
                    window.scrollTo(0, Math.abs(scrollY));
                }
            },

            async copyToClipboard(text) {
                try {
                    // 调用APP复制协议
                    window.location.href = `aecmd://buy/copy?text=${encodeURIComponent(text)}`;
                    
                    // 备用复制方案
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        const textArea = document.createElement("textarea");
                        textArea.value = text;
                        textArea.style.position = "fixed";
                        textArea.style.left = "-999999px";
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        textArea.remove();
                    }
                } catch (err) {
                    document.getElementById('toast').textContent = 'Copy failed';
                    document.getElementById('toast').className = 'toast show';
                    setTimeout(() => {
                        document.getElementById('toast').className = 'toast';
                    }, 3000);
                }
            },

            // 添加翻译函数
            async translateText(text) {
                try {
                    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=zh-CN&tl=en&q=${encodeURIComponent(text)}`);
                    if (!response.ok) {
                        throw new Error('Translation request failed');
                    }
                    const data = await response.json();
                    return data[0][0][0];  // 获取翻译结果
                } catch (error) {
                    console.error('Translation failed:', error);
                    // 如果翻译失败，直接返回原文
                    return text;
                }
            }
        };

        // 简化图片处理对象
        const imageHandler = {
            currentImageIndex: 0,
            imageUrls: [],
            scale: 1,
            lastScale: 1,
            initialDistance: 0,
            translateX: 0,
            translateY: 0,
            lastX: 0,
            lastY: 0,

            loadImages(urls) {
                this.imageUrls = urls;  // 保存所有图片URL
            },

            openModal(index) {
                this.currentImageIndex = index;
                utils.handleScroll('lock');
                const modal = document.getElementById('myModal');
                const modalImg = document.getElementById('modalImage');
                modalImg.src = this.imageUrls[index];  // 设置正确的图片URL
                modal.style.display = "flex";
            },

            closeModal() {
                utils.handleScroll('unlock');
                document.getElementById('myModal').style.display = "none";
            },

            nextImage() {
                this.currentImageIndex = (this.currentImageIndex + 1) % this.imageUrls.length;
                document.getElementById('modalImage').src = this.imageUrls[this.currentImageIndex];
            },

            prevImage() {
                this.currentImageIndex = (this.currentImageIndex - 1 + this.imageUrls.length) % this.imageUrls.length;
                document.getElementById('modalImage').src = this.imageUrls[this.currentImageIndex];
            },

            // 计算两个触摸点之间的距离
            getDistance(touch1, touch2) {
                return Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
            },

            // 修改缩放处理方法
            handlePinch(e) {
                if (e.touches.length === 2) {
                    const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                    
                    if (this.initialDistance === 0) {
                        this.initialDistance = currentDistance;
                        this.lastScale = this.scale;
                        return;
                    }

                    // 使用更小的缩放步进
                    const scaleFactor = currentDistance / this.initialDistance;
                    const newScale = this.lastScale * scaleFactor;
                    
                    // 限制缩放范围，但使用更精细的步进
                    this.scale = Math.min(Math.max(1, newScale), 5);
                    
                    // 使用 requestAnimationFrame 实现更流畅的动画
                    requestAnimationFrame(() => {
                        this.updateTransform();
                    });
                }
            },

            // 修改移动处理方法
            handleMove(e) {
                if (this.scale > 1 && e.touches.length === 1) {
                    const touch = e.touches[0];
                    const deltaX = touch.clientX - this.lastX;
                    const deltaY = touch.clientY - this.lastY;
                    
                    // 根据缩放比例调整移动速度
                    const moveSpeed = 1 / this.scale;
                    this.translateX += deltaX * moveSpeed;
                    this.translateY += deltaY * moveSpeed;
                    
                    // 根据缩放比例动态调整移动范围
                    const maxTranslate = (this.scale - 1) * 200;
                    this.translateX = Math.min(Math.max(-maxTranslate, this.translateX), maxTranslate);
                    this.translateY = Math.min(Math.max(-maxTranslate, this.translateY), maxTranslate);
                    
                    this.lastX = touch.clientX;
                    this.lastY = touch.clientY;
                    
                    requestAnimationFrame(() => {
                        this.updateTransform();
                    });
                }
            },

            updateTransform() {
                const modalImg = document.getElementById('modalImage');
                // 移除 transform 的过渡效果，使缩放更加即时
                modalImg.style.transition = 'none';
                modalImg.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
                
                // 在下一帧恢复过渡效果
                requestAnimationFrame(() => {
                    modalImg.style.transition = 'transform 0.05s ease-out';
                });
            },

            initEvents() {
                const modal = document.getElementById('myModal');
                const prevBtn = modal.querySelector('.modal-prev');
                const nextBtn = modal.querySelector('.modal-next');

                // 添加标记变量
                let isPinching = false;

                modal.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 2) {
                        e.preventDefault();
                        isPinching = true;
                        this.initialDistance = 0;
                    } else if (e.touches.length === 1 && !isPinching) {  // 只有不在缩放时才处理单指触摸
                        this.lastX = e.touches[0].clientX;
                        this.lastY = e.touches[0].clientY;
                    }
                });

                modal.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    if (e.touches.length === 2 && isPinching) {
                        this.handlePinch(e);
                    } else if (e.touches.length === 1 && !isPinching && this.scale > 1) {
                        this.handleMove(e);
                    }
                });

                modal.addEventListener('touchend', (e) => {
                    if (e.touches.length === 0) {  // 所有手指都离开了
                        isPinching = false;
                        this.initialDistance = 0;
                    } else if (e.touches.length === 1 && isPinching) {  // 从双指变成单指
                        // 重置单指触摸的起始位置
                        this.lastX = e.touches[0].clientX;
                        this.lastY = e.touches[0].clientY;
                    }
                });

                // 切换图片时重置位置
                prevBtn.onclick = () => {
                    this.prevImage();
                    this.resetPosition();
                };
                nextBtn.onclick = () => {
                    this.nextImage();
                    this.resetPosition();
                };
            },

            resetPosition() {
                this.scale = 1;
                this.translateX = 0;
                this.translateY = 0;
                this.updateTransform();
            }
        };

        // WhatsApp处理
        const whatsappHandler = {
            init() {
                const modal = document.getElementById('whatsappModal');
                if (!modal) return;

                // 绑定事件
                document.getElementById('openWhatsApp').onclick = this.openChat;
                document.getElementById('copyNumber').onclick = (e) => {
                    e.preventDefault();
                    utils.copyToClipboard(window.sellerNumber);
                    this.closeModal();
                };
                document.getElementById('closeWhatsappModal').onclick = this.closeModal;
                modal.onclick = (e) => {
                    if (e.target === modal) this.closeModal();
                };
            },

            openModal(event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                utils.handleScroll('lock');
                document.getElementById('whatsappModal').style.display = "flex";
            },

            closeModal() {
                utils.handleScroll('unlock');
                document.getElementById('whatsappModal').style.display = "none";
            },

            openChat() {
                const phoneNumber = window.sellerNumber;
                const message = encodeURIComponent("Hello!");
                window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
                setTimeout(() => {
                    window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
                }, 500);
                whatsappHandler.closeModal();
            }
        };
