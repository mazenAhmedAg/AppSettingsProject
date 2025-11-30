// ==========================================
// PARTICLES BACKGROUND (LEFT PANEL)
// ==========================================
function initLandingVisual() {
    const canvas = document.getElementById('landingCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random();
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0;
            if (this.y < 0) this.y = height;
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// ==========================================
// THREE.JS TECH VISUAL (RIGHT PANEL)
// ==========================================
function initTechVisual() {
    const canvas = document.getElementById('techCanvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    const container = document.querySelector('.right-panel');
    const updateSize = () => {
        if (!container) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    };
    updateSize();
    
    camera.position.z = 6;

    const group = new THREE.Group();
    scene.add(group);

    // Core
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0x8B5CF6,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const core = new THREE.Mesh(geometry, material);
    group.add(core);

    // Cubes
    const cubeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const cubeMat = new THREE.MeshBasicMaterial({ color: 0xEC4899, wireframe: true });
    
    for(let i=0; i<15; i++) {
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        cube.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
        cube.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
        group.add(cube);
    }

    // Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xA78BFA, transparent: true, opacity: 0.2 });
    const points = [];
    for(let i=0; i<20; i++) {
        points.push(new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        ));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lines = new THREE.Line(lineGeo, lineMat);
    group.add(lines);

    function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += 0.002;
        group.rotation.x += 0.001;
        core.rotation.y -= 0.005;
        renderer.render(scene, camera);
    }
    
    animate();
    window.addEventListener('resize', updateSize);
}

// ==========================================
// PAGE TRANSITION LOGIC
// ==========================================
function handleStart() {
    const startBtn = document.getElementById('startBtn');
    const landing = document.getElementById('landingSection');
    const mainApp = document.getElementById('mainApp');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!landing || !mainApp || !startBtn || !loadingOverlay) return;
    
    // 1. Move Button Right & Fade Out
    startBtn.classList.add('expand');
    
    // 2. Show Black Loading Screen Immediately
    loadingOverlay.classList.add('show');
    
    // Prepare Main App in background
    mainApp.style.display = 'flex';
    mainApp.style.opacity = '0';
    
    initTechVisual();
    
    // 3. Finish Loading and Enter System
    setTimeout(() => {
        requestAnimationFrame(() => {
            landing.classList.add('slide-up');
        });

        loadingOverlay.classList.remove('show');
        
        setTimeout(() => {
            mainApp.style.transition = 'opacity 1.5s ease';
            mainApp.style.opacity = '1';
        }, 500);
        
    }, 3000);
}

// ==========================================
// DATABASE CONFIGURATION LOGIC
// ==========================================
const defaultCatalogs = {
    'DefaultConnection': 'MEDICAL_NET',
    'WhatsappQueueConnection': 'WhatsappConfiguration',
    'PharmacyConnection': 'Pharmacy',
    'WaseelConnection': 'WASEEL',
    'MedicalNetConnection': 'MEDICAL_NET',
    'AccountsConnection': 'main_acc_wh',
    'NaphisConnection': 'NAPHIS'
};

let catalogModifications = {};

function initConnectionSelector() {
    const selector = document.getElementById('connectionSelector');
    const dbInputContainer = document.getElementById('dbNameContainer');
    const dbInput = document.getElementById('dbNameInput');

    if (selector && dbInput) {
        selector.addEventListener('change', (e) => {
            const selectedKey = e.target.value;
            if (selectedKey) {
                dbInputContainer.style.display = 'block';
                const defaultVal = defaultCatalogs[selectedKey];
                dbInput.placeholder = `الافتراضي: ${defaultVal}`;
                dbInput.value = catalogModifications[selectedKey] || '';
                dbInput.focus();
            }
        });

        dbInput.addEventListener('input', (e) => {
            const selectedKey = selector.value;
            if (selectedKey) {
                catalogModifications[selectedKey] = e.target.value.trim();
            }
        });
    }
}

// ==========================================
// GENERATE CONFIG FILE
// ==========================================
function generateConfigFile() {
    const serverIP = document.getElementById('serverIP').value || '192.168.1.100';
    const dbUser = 'bilal'; // قيمة ثابتة
    const dbPassword = 'hassan'; // قيمة ثابتة
    
    const waseelUser = document.getElementById('waseelUser').value || '';
    const waseelPassword = document.getElementById('waseelPassword').value || '';
    const providerId = document.getElementById('providerId').value || '';
    
    // Get Zatca Mode
    const zatcaModeInput = document.querySelector('input[name="zatcaMode"]:checked');
    const zatcaMode = zatcaModeInput ? zatcaModeInput.value : 'Production';

    let connectionStrings = '';
    const keys = Object.keys(defaultCatalogs);
    
    keys.forEach((key, index) => {
        const catalog = catalogModifications[key] || defaultCatalogs[key];
        const isLast = index === keys.length - 1;
        const comma = isLast ? '' : ',';
        
        // Special case: NaphisConnection uses fixed IP
        let dataSource = serverIP;
        if (key === 'NaphisConnection') {
            dataSource = '93.112.16.59';
        }
        
        // Custom logic for Pharmacy/Waseel (shorter strings in original image)
        let line = '';
        if (key === 'PharmacyConnection' || key === 'WaseelConnection') {
             line = `    "${key}": "Data Source=${dataSource};Initial Catalog=${catalog};Persist Security Info=True;User ID=${dbUser};Password=${dbPassword};TrustServerCertificate=True;"${comma}`;
        } else {
             line = `    "${key}": "Data Source=${dataSource};Initial Catalog=${catalog};Persist Security Info=True;User ID=${dbUser};Password=${dbPassword};TrustServerCertificate=True;MultipleActiveResultSets=True;"${comma}`;
        }
        
        connectionStrings += `${line}\n`;
    });
    
    // Build ZatcaApi Section
    let zatcaSection = '';
    if (zatcaMode === 'None') {
        zatcaSection = `
  /*"ZatcaApi": {
    "BaseUrlProducation": "https://gw-fatoora.zatca.gov.sa/e-invoicing/core/",
    "BaseUrlTest": "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/",
    "Mode": "Production"
  },*/`;
    } else {
        zatcaSection = `
  "ZatcaApi": {
    "BaseUrlProducation": "https://gw-fatoora.zatca.gov.sa/e-invoicing/core/",
    "BaseUrlTest": "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/",
    "Mode": "${zatcaMode}"
  },`;
    }

    const fileContent = `{
  "ConnectionStrings": {
    //"DefaultConnection": "Data Source=37.224.27.41;Initial Catalog=medical_net;Persist Security Info=True;User ID=bilal;Password=hassan;TrustServerCertificate=True;MultipleActiveResultSets=True;",
    //"PharmacyConnection": "Data Source=37.224.27.41;Initial Catalog=Pharmacy;Persist Security Info=True;User ID=bilal;Password=hassan;TrustServerCertificate=True;",
    //"WaseelConnection": "Data Source=37.224.27.41;Initial Catalog=WASEEL;Persist Security Info=True;User ID=bilal;Password=hassan;TrustServerCertificate=True;",
    //"MedicalNetConnection": "Data Source=37.224.27.41;Initial Catalog=medical_net;Persist Security Info=True;User ID=bilal;Password=hassan;TrustServerCertificate=True;MultipleActiveResultSets=True;",
    //"DefaultConnection": "Data Source=.;Initial Catalog=medical_net_ahmady;Persist Security Info=True;User ID=bilal;Password=hassan;TrustServerCertificate=True;MultipleActiveResultSets=True;",
    //"DefaultConnection": "Data Source=26.182.168.35;Initial Catalog=Medical_Net_mash;Persist Security Info=True;User ID=bilal;Password=hassan;TrustServerCertificate=True;MultipleActiveResultSets=True;",
${connectionStrings}
  },
${zatcaSection}

  "ApiSettings": {
    //CCHI Beneficiary Endpoints
    "WaseelBaseUrl": "https://api.eclaims.waseel.com",
    "STGWaseelBaseUrl": "https://api.stg-eclaims.waseel.com",

    "TokenEndpoint": "/oauth/authenticate",
    "BeneficiaryEndpoint": "/beneficiaries/providers/{providerId}/patientKey/{patientId}/systemType/{typeCode}",
    "EligibilityEndpoint": "/eligibilities/providers/{providerId}/request",

    "Username": "${waseelUser}",
    "Password": "${waseelPassword}",
    "providerId": "${providerId}"
  },

  "JWTSettings": {
    "SecretKey": "MyNameAttiahGommahMohammedMYBigSonAdelDaughterAbeer"
  },
  "DetailedErrors": true,

  "AllowedHosts": "*",
  "Serilog": {
    "Using": [],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File",
        "Args": {
          "path": "C:\\\\WEB ERROR\\\\logs.txt",
          "outputTemplate": "{Timestamp} {Message}{NewLine:1}{Exception:1}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "C:\\\\WEB ERROR\\\\logs.txt",
          "formatter": "Serilog.Formatting.Json.JsonFormatter, Serilog"
        }
      },
      {
        "Name": "MSSqlServer",
        "Args": {
          "connectionString": "Add your connectionString here",
          "sinkOptionsSection": {
            "tableName": "Logs",
            "schemaName": "logging",
            "autoCreateSqlTable": true
          },
          "restrictedToMinimumLevel": "Warning"
        }
      }
    ],
    "Enrich": [
      "FromLogContext",
      "WithMachineName",
      "WithProcessId",
      "WithThreadId"
    ],
    "Properties": {
      "ApplicationName": "Serilog.BelalMedical"
    }
  },
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://${serverIP}:5000"
      }
    }
  }
}`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appsettings.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showInputSuccess('تم إنشاء ملف الإعدادات بنجاح!');
}

function showInputSuccess(message) {
    const container = document.getElementById('alertContainer');
    
    // Remove existing alerts
    const existingAlerts = container.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    container.appendChild(alert);

    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initLandingVisual();
    initConnectionSelector();
    
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleStart();
        });
    }
    
    const form = document.getElementById('configForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            generateConfigFile();
        });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (form) form.reset();
            
            const inputGroups = document.querySelectorAll('.input-group');
            inputGroups.forEach(group => group.classList.remove('valid'));
            
            // Reset modifications
            catalogModifications = {};
            const dbInputContainer = document.getElementById('dbNameContainer');
            if (dbInputContainer) dbInputContainer.style.display = 'none';
            const selector = document.getElementById('connectionSelector');
            if (selector) selector.value = '';
        });
    }
    
    // Input Validation
    const inputs = document.querySelectorAll('input');
    let typingTimer;
    const doneTypingInterval = 800;

    const fieldNames = {
        'serverIP': 'عنوان IP',
        'dbUser': 'مستخدم قاعدة البيانات',
        'dbPassword': 'كلمة المرور',
        'waseelUser': 'مستخدم Waseel',
        'waseelPassword': 'كلمة مرور Waseel',
        'providerId': 'معرف المزود',
        'dbNameInput': 'اسم قاعدة البيانات'
    };

    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(typingTimer);
            const group = this.closest('.input-group');
            
            if (this.value.trim() !== '') {
                group.classList.add('valid');
                
                typingTimer = setTimeout(() => {
                    const fieldName = fieldNames[this.id] || 'الحقل';
                    showInputSuccess(`تم إدخال ${fieldName}`);
                }, doneTypingInterval);
            } else {
                group.classList.remove('valid');
            }
        });
    });
});
